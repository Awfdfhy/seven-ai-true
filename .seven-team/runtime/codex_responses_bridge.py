#!/usr/bin/env python3
"""Responses-API compatibility bridge for Codex -> Seven local chat relay."""
from __future__ import annotations
import http.client, http.server, json, os, re, socketserver, sys, time, uuid
from urllib.parse import urlsplit

HOST=os.environ.get("SEVEN_CODEX_BRIDGE_HOST","127.0.0.1")
PORT=int(os.environ.get("SEVEN_CODEX_BRIDGE_PORT","8878"))
UPSTREAM_HOST="127.0.0.1"
UPSTREAM_PORT=int(os.environ.get("SEVEN_RELAY_PORT","8877"))
MODEL=os.environ.get("SEVEN_CODEX_MODEL","kilo-auto/free")

def _text(parts):
    if isinstance(parts,str): return parts
    out=[]
    for p in parts or []:
        if not isinstance(p,dict): continue
        t=p.get("text")
        if isinstance(t,str): out.append(t)
        elif p.get("type") in {"input_text","output_text"} and isinstance(p.get("text"),str): out.append(p["text"])
    return "\n".join(out)

def responses_to_chat(body):
    messages=[]
    instructions=body.get("instructions")
    if isinstance(instructions,str) and instructions.strip():
        messages.append({"role":"system","content":instructions})
    call_names={}
    pending_calls={}
    for item in body.get("input") or []:
        if isinstance(item,str):
            messages.append({"role":"user","content":item}); continue
        if not isinstance(item,dict): continue
        typ=item.get("type")
        if typ=="message":
            role=item.get("role") or "user"
            if role=="developer": role="system"
            messages.append({"role":role,"content":_text(item.get("content"))})
        elif typ in {"function_call","custom_tool_call"}:
            cid=item.get("call_id") or item.get("id") or f"call_{uuid.uuid4().hex[:8]}"
            name=item.get("name") or "tool"
            args=item.get("arguments")
            if args is None:
                raw=item.get("input")
                args=json.dumps({"input":raw}) if isinstance(raw,str) else json.dumps(raw or {})
            elif not isinstance(args,str):
                args=json.dumps(args)
            pending_calls[cid]={"id":cid,"type":"function","function":{"name":name,"arguments":args}}
            call_names[cid]=name
        elif typ in {"function_call_output","custom_tool_call_output"}:
            cid=item.get("call_id") or item.get("id") or ""
            if pending_calls:
                messages.append({"role":"assistant","content":None,"tool_calls":list(pending_calls.values())})
                pending_calls={}
            output=item.get("output")
            if not isinstance(output,str): output=json.dumps(output,ensure_ascii=False)
            messages.append({"role":"tool","tool_call_id":cid,"content":output})
    if pending_calls:
        messages.append({"role":"assistant","content":None,"tool_calls":list(pending_calls.values())})

    tools=[]
    tool_kinds={}
    for tool in body.get("tools") or []:
        if not isinstance(tool,dict): continue
        typ=tool.get("type")
        name=tool.get("name")
        if typ=="function" and name:
            params=tool.get("parameters") or {"type":"object","properties":{}}
            tools.append({"type":"function","function":{"name":name,"description":tool.get("description",""),"parameters":params}})
            tool_kinds[name]="function"
        elif typ=="custom" and name:
            tools.append({"type":"function","function":{"name":name,"description":tool.get("description",""),"parameters":{"type":"object","properties":{"input":{"type":"string"}},"required":["input"]}}})
            tool_kinds[name]="custom"
    req={"model":MODEL,"messages":messages or [{"role":"user","content":"Continue."}],"stream":False}
    if tools:
        req["tools"]=tools
        req["tool_choice"]="auto"
    return req,tool_kinds

def upstream_chat(req):
    conn=http.client.HTTPConnection(UPSTREAM_HOST,UPSTREAM_PORT,timeout=180)
    raw=json.dumps(req).encode()
    conn.request("POST","/v1/chat/completions",body=raw,headers={"Content-Type":"application/json"})
    res=conn.getresponse()
    data=res.read()
    status=res.status
    conn.close()
    if status<200 or status>=300:
        raise RuntimeError(f"upstream status {status}: {data[:1000]!r}")
    return json.loads(data)

def sse_event(kind,payload):
    return f"event: {kind}\ndata: {json.dumps(payload,separators=(',',':'),ensure_ascii=False)}\n\n".encode()

class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version="HTTP/1.1"
    def log_message(self,fmt,*args):
        sys.stderr.write("[codex-bridge] "+(fmt%args)+"\n")
    def do_GET(self):
        path=urlsplit(self.path).path
        if path.endswith("/models"):
            body=json.dumps({"object":"list","data":[{"id":MODEL,"object":"model","owned_by":"seven"}]}).encode()
            self.send_response(200); self.send_header("Content-Type","application/json"); self.send_header("Content-Length",str(len(body))); self.end_headers(); self.wfile.write(body); return
        self.send_error(404)
    def do_POST(self):
        path=urlsplit(self.path).path
        if not path.endswith("/responses"):
            self.send_error(404); return
        length=int(self.headers.get("Content-Length","0") or "0")
        try:
            body=json.loads(self.rfile.read(length) or b"{}")
            req,kinds=responses_to_chat(body)
            data=upstream_chat(req)
            choice=(data.get("choices") or [{}])[0]
            msg=choice.get("message") or {}
            rid=data.get("id") or ("resp_"+uuid.uuid4().hex)
            events=[("response.created",{"type":"response.created","response":{"id":rid}})]
            calls=msg.get("tool_calls") or []
            if calls:
                for i,call in enumerate(calls):
                    fn=call.get("function") or {}
                    name=fn.get("name") or "tool"
                    cid=call.get("id") or f"call_{uuid.uuid4().hex[:8]}"
                    args=fn.get("arguments") or "{}"
                    if kinds.get(name)=="custom":
                        try:
                            obj=json.loads(args)
                            raw=obj.get("input") if isinstance(obj,dict) else args
                        except Exception:
                            raw=args
                        item={"type":"custom_tool_call","call_id":cid,"name":name,"input":raw if isinstance(raw,str) else json.dumps(raw)}
                    else:
                        item={"type":"function_call","call_id":cid,"name":name,"arguments":args}
                    events.append(("response.output_item.done",{"type":"response.output_item.done","item":item}))
            else:
                text=msg.get("content") or ""
                item_id="msg_"+uuid.uuid4().hex[:12]
                events.append(("response.output_item.done",{"type":"response.output_item.done","item":{"type":"message","role":"assistant","id":item_id,"content":[{"type":"output_text","text":text}]}}))
            usage=data.get("usage") or {}
            events.append(("response.completed",{"type":"response.completed","response":{"id":rid,"usage":{"input_tokens":usage.get("prompt_tokens",0),"input_tokens_details":None,"output_tokens":usage.get("completion_tokens",0),"output_tokens_details":None,"total_tokens":usage.get("total_tokens",0)}}}))
            self.send_response(200)
            self.send_header("Content-Type","text/event-stream")
            self.send_header("Cache-Control","no-cache")
            self.send_header("Connection","close")
            self.end_headers()
            for kind,payload in events:
                self.wfile.write(sse_event(kind,payload)); self.wfile.flush()
        except Exception as exc:
            payload={"type":"response.failed","response":{"id":"resp_error","error":{"code":"seven_bridge_error","message":str(exc)}}}
            raw=sse_event("response.failed",payload)
            self.send_response(200); self.send_header("Content-Type","text/event-stream"); self.send_header("Connection","close"); self.end_headers(); self.wfile.write(raw)

class Server(socketserver.ThreadingMixIn,http.server.HTTPServer):
    daemon_threads=True

if __name__=="__main__":
    print(f"Seven Codex bridge listening on http://{HOST}:{PORT}",flush=True)
    Server((HOST,PORT),Handler).serve_forever()

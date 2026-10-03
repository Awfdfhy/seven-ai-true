#!/usr/bin/env python3
"""Gemini generateContent compatibility bridge -> Seven local OpenAI-chat relay."""
from __future__ import annotations
import http.client, http.server, json, math, os, re, socketserver, sys, uuid
from urllib.parse import urlsplit, unquote

HOST=os.environ.get("SEVEN_GEMINI_BRIDGE_HOST","127.0.0.1")
PORT=int(os.environ.get("SEVEN_GEMINI_BRIDGE_PORT","8879"))
UPSTREAM_PORT=int(os.environ.get("SEVEN_RELAY_PORT","8877"))
MODEL=os.environ.get("SEVEN_GEMINI_MODEL","kilo-auto/free")

def parts_text(parts):
    out=[]
    for p in parts or []:
        if isinstance(p,dict) and isinstance(p.get("text"),str): out.append(p["text"])
    return "\n".join(out)

def gemini_to_chat(body):
    messages=[]
    sysi=body.get("systemInstruction") or body.get("system_instruction")
    if isinstance(sysi,dict):
        txt=parts_text(sysi.get("parts"))
        if txt: messages.append({"role":"system","content":txt})
    elif isinstance(sysi,str) and sysi:
        messages.append({"role":"system","content":sysi})

    pending=[]
    call_ids={}
    for content in body.get("contents") or []:
        if not isinstance(content,dict): continue
        role=content.get("role") or "user"
        chat_role="assistant" if role=="model" else "user"
        text_parts=[]
        for idx,p in enumerate(content.get("parts") or []):
            if not isinstance(p,dict): continue
            if isinstance(p.get("text"),str):
                text_parts.append(p["text"])
            fc=p.get("functionCall")
            if isinstance(fc,dict):
                name=fc.get("name") or "tool"
                cid=fc.get("id") or f"call_{name}_{idx}"
                call_ids[name]=cid
                args=fc.get("args") or {}
                pending.append({"id":cid,"type":"function","function":{"name":name,"arguments":json.dumps(args,ensure_ascii=False)}})
            fr=p.get("functionResponse")
            if isinstance(fr,dict):
                if pending:
                    messages.append({"role":"assistant","content":"\n".join(text_parts) or None,"tool_calls":pending})
                    pending=[]; text_parts=[]
                name=fr.get("name") or "tool"
                cid=fr.get("id") or call_ids.get(name) or f"call_{name}"
                response=fr.get("response")
                if isinstance(response,str): output=response
                else: output=json.dumps(response,ensure_ascii=False)
                messages.append({"role":"tool","tool_call_id":cid,"content":output})
        if pending:
            messages.append({"role":"assistant","content":"\n".join(text_parts) or None,"tool_calls":pending})
            pending=[]; text_parts=[]
        elif text_parts:
            messages.append({"role":chat_role,"content":"\n".join(text_parts)})

    tools=[]
    for group in body.get("tools") or []:
        if not isinstance(group,dict): continue
        decls=group.get("functionDeclarations") or group.get("function_declarations") or []
        for d in decls:
            if not isinstance(d,dict) or not d.get("name"): continue
            params=d.get("parametersJsonSchema") or d.get("parameters") or {"type":"object","properties":{}}
            tools.append({"type":"function","function":{"name":d["name"],"description":d.get("description",""),"parameters":params}})
    req={"model":MODEL,"messages":messages or [{"role":"user","content":"Continue."}],"stream":False}
    if tools:
        req["tools"]=tools; req["tool_choice"]="auto"
    gen=body.get("generationConfig") or {}
    if isinstance(gen,dict):
        if isinstance(gen.get("temperature"),(int,float)): req["temperature"]=gen["temperature"]
        if isinstance(gen.get("maxOutputTokens"),int): req["max_tokens"]=gen["maxOutputTokens"]
    return req

def upstream_chat(req):
    conn=http.client.HTTPConnection("127.0.0.1",UPSTREAM_PORT,timeout=180)
    raw=json.dumps(req).encode()
    conn.request("POST","/v1/chat/completions",body=raw,headers={"Content-Type":"application/json"})
    res=conn.getresponse(); data=res.read(); status=res.status; conn.close()
    if status<200 or status>=300: raise RuntimeError(f"upstream {status}: {data[:800]!r}")
    return json.loads(data)

def to_gemini(data):
    choice=(data.get("choices") or [{}])[0]
    msg=choice.get("message") or {}
    parts=[]
    calls=msg.get("tool_calls") or []
    if calls:
        for call in calls:
            fn=call.get("function") or {}
            args=fn.get("arguments") or "{}"
            try: obj=json.loads(args)
            except Exception: obj={"input":args}
            parts.append({"functionCall":{"name":fn.get("name") or "tool","args":obj,"id":call.get("id")}})
    if msg.get("content"):
        parts.append({"text":msg["content"]})
    usage=data.get("usage") or {}
    return {
        "candidates":[{
            "content":{"role":"model","parts":parts or [{"text":""}]},
            "finishReason":"STOP",
            "index":0
        }],
        "usageMetadata":{
            "promptTokenCount":usage.get("prompt_tokens",0),
            "candidatesTokenCount":usage.get("completion_tokens",0),
            "totalTokenCount":usage.get("total_tokens",0)
        }
    }

def send_json(h,status,obj):
    raw=json.dumps(obj,ensure_ascii=False).encode()
    h.send_response(status); h.send_header("Content-Type","application/json"); h.send_header("Content-Length",str(len(raw))); h.send_header("Connection","close"); h.end_headers(); h.wfile.write(raw)

class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version="HTTP/1.1"
    def log_message(self,fmt,*args): sys.stderr.write("[gemini-bridge] "+(fmt%args)+"\n")
    def do_GET(self):
        path=urlsplit(self.path).path
        if path.endswith("/models") or "/models/" in path:
            send_json(self,200,{"models":[{"name":f"models/{MODEL}","displayName":"Seven Free Bridge","supportedGenerationMethods":["generateContent","countTokens"]}]}); return
        self.send_error(404)
    def do_POST(self):
        parsed=urlsplit(self.path); path=parsed.path
        length=int(self.headers.get("Content-Length","0") or "0")
        try: body=json.loads(self.rfile.read(length) or b"{}")
        except Exception as exc: send_json(self,400,{"error":{"message":str(exc)}}); return
        try:
            if ":countTokens" in path:
                chars=len(json.dumps(body,ensure_ascii=False))
                send_json(self,200,{"totalTokens":max(1,math.ceil(chars/4))}); return
            if ":generateContent" not in path and ":streamGenerateContent" not in path:
                send_json(self,404,{"error":{"message":"route-not-supported"}}); return
            req=gemini_to_chat(body)
            data=to_gemini(upstream_chat(req))
            streaming=":streamGenerateContent" in path or "alt=sse" in parsed.query
            if streaming:
                raw=("data: "+json.dumps(data,separators=(",",":"),ensure_ascii=False)+"\n\n").encode()
                self.send_response(200); self.send_header("Content-Type","text/event-stream"); self.send_header("Cache-Control","no-cache"); self.send_header("Connection","close"); self.end_headers(); self.wfile.write(raw); self.wfile.flush()
            else:
                send_json(self,200,data)
        except Exception as exc:
            send_json(self,500,{"error":{"code":500,"message":f"seven-gemini-bridge: {exc}","status":"INTERNAL"}})

class Server(socketserver.ThreadingMixIn,http.server.HTTPServer):
    daemon_threads=True
if __name__=="__main__":
    print(f"Seven Gemini bridge listening on http://{HOST}:{PORT}",flush=True)
    Server((HOST,PORT),Handler).serve_forever()

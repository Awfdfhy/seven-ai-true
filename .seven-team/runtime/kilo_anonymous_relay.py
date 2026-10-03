#!/usr/bin/env python3
"""Tiny localhost relay for Kilo anonymous free-model access.

Purpose:
- lets OpenAI-compatible CLIs that insist on an API key use a dummy local key;
- strips Authorization before forwarding, so Kilo sees an anonymous request;
- only proxies model listing and chat-completion routes;
- never exposes GitHub tokens or environment variables to the upstream service.

Kilo's anonymous free access is rate limited and may route to providers that log
prompts/outputs. Use only with public/non-confidential repository material.
"""
from __future__ import annotations
import http.client
import http.server
import json
import os
import socketserver
import sys
import time
from urllib.parse import urlsplit

HOST = os.environ.get("SEVEN_RELAY_HOST", "127.0.0.1")
PORT = int(os.environ.get("SEVEN_RELAY_PORT", "8877"))
BRIDGE_STREAM = os.environ.get("SEVEN_RELAY_BRIDGE_STREAM", "").strip().lower() in {"1", "true", "yes"}
UPSTREAM = "api.kilo.ai"
PREFIX = "/api/gateway"

ALLOWED = {
    "/models": "/models",
    "/v1/models": "/models",
    "/chat/completions": "/chat/completions",
    "/v1/chat/completions": "/chat/completions",
}

class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        sys.stderr.write("[seven-relay] " + (fmt % args) + "\n")

    def _proxy(self):
        target = ALLOWED.get(urlsplit(self.path).path)
        if not target:
            body = json.dumps({"error": "route-not-allowed"}).encode()
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        length = int(self.headers.get("Content-Length", "0") or "0")
        payload = self.rfile.read(length) if length else None
        headers = {"Content-Type": self.headers.get("Content-Type", "application/json")}

        # Some coding CLIs require OpenAI-style SSE streaming even when a free
        # upstream gateway is more reliable in non-stream mode. When explicitly
        # enabled, request one complete response upstream and translate it into
        # a standards-shaped SSE stream locally. Other workers retain pass-through.
        bridge_stream = False
        if BRIDGE_STREAM and target == "/chat/completions" and payload:
            try:
                request_json = json.loads(payload.decode("utf-8"))
                bridge_stream = bool(request_json.get("stream"))
                if bridge_stream:
                    request_json["stream"] = False
                    request_json.pop("stream_options", None)
                    payload = json.dumps(request_json).encode("utf-8")
            except Exception:
                bridge_stream = False

        # Intentionally DO NOT forward Authorization or any other caller headers.
        # The anonymous free upstream is occasionally rate-limited/transiently unavailable
        # when multiple Seven agents start together. Retry only transient statuses/errors;
        # never hide deterministic 4xx failures.
        res = None
        conn = None
        transient_statuses = {429, 500, 502, 503, 504}
        last_exc = None
        for attempt in range(1, 5):
            try:
                conn = http.client.HTTPSConnection(UPSTREAM, timeout=180)
                conn.request(self.command, PREFIX + target, body=payload, headers=headers)
                res = conn.getresponse()
                if res.status not in transient_statuses or attempt == 4:
                    break
                retry_after = res.getheader("Retry-After")
                try:
                    delay = min(20, max(1, int(retry_after))) if retry_after else 2 ** attempt
                except Exception:
                    delay = 2 ** attempt
                res.read()
                conn.close()
                conn = None
                sys.stderr.write(f"[seven-relay] transient upstream {res.status}; retry {attempt}/4 after {delay}s\n")
                time.sleep(delay)
            except (OSError, http.client.HTTPException) as exc:
                last_exc = exc
                if conn:
                    try:
                        conn.close()
                    except Exception:
                        pass
                conn = None
                if attempt == 4:
                    raise
                delay = 2 ** attempt
                sys.stderr.write(f"[seven-relay] transient upstream error {exc!r}; retry {attempt}/4 after {delay}s\n")
                time.sleep(delay)
        if res is None:
            raise RuntimeError(f"upstream unavailable after retries: {last_exc!r}")

        if bridge_stream and 200 <= res.status < 300:
            raw = res.read()
            conn.close()
            try:
                data = json.loads(raw.decode("utf-8"))
                choices = []
                for idx, choice in enumerate(data.get("choices") or []):
                    message = choice.get("message") or {}
                    delta = {"role": message.get("role") or "assistant"}
                    if message.get("content") is not None:
                        delta["content"] = message.get("content")
                    if message.get("reasoning_content") is not None:
                        delta["reasoning_content"] = message.get("reasoning_content")
                    calls = message.get("tool_calls")
                    if isinstance(calls, list):
                        normalized = []
                        for call_idx, call in enumerate(calls):
                            item = dict(call)
                            item.setdefault("index", call_idx)
                            normalized.append(item)
                        delta["tool_calls"] = normalized
                    choices.append({
                        "index": choice.get("index", idx),
                        "delta": delta,
                        "finish_reason": choice.get("finish_reason"),
                    })
                chunk = {
                    "id": data.get("id") or "seven-relay",
                    "object": "chat.completion.chunk",
                    "created": data.get("created", 0),
                    "model": data.get("model") or request_json.get("model"),
                    "choices": choices,
                }
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Connection", "close")
                self.end_headers()
                # Qwen Code requires a non-null finish_reason on a chunk that it
                # actually consumes. Some client versions ignore an otherwise-empty
                # terminal delta, so attach the inferred finish reason to the payload
                # chunk itself and also emit a terminal chunk for standards parity.
                if not chunk["choices"]:
                    chunk["choices"] = [{
                        "index": 0,
                        "delta": {"role": "assistant", "content": ""},
                        "finish_reason": "stop",
                    }]
                else:
                    source_choices = data.get("choices") or []
                    for idx, item in enumerate(chunk["choices"]):
                        source = source_choices[idx] if idx < len(source_choices) else {}
                        message = source.get("message") or {}
                        finish = source.get("finish_reason")
                        if not finish:
                            finish = "tool_calls" if message.get("tool_calls") else "stop"
                        item["finish_reason"] = finish
                self.wfile.write(("data: " + json.dumps(chunk, separators=(",", ":")) + "\n\n").encode())

                terminal_choices = [{
                    "index": item.get("index", idx),
                    "delta": {},
                    "finish_reason": item.get("finish_reason") or "stop",
                } for idx, item in enumerate(chunk["choices"])]
                terminal = {
                    "id": data.get("id") or "seven-relay",
                    "object": "chat.completion.chunk",
                    "created": data.get("created", 0),
                    "model": data.get("model") or request_json.get("model"),
                    "choices": terminal_choices,
                }
                self.wfile.write(("data: " + json.dumps(terminal, separators=(",", ":")) + "\n\n").encode())
                self.wfile.write(b"data: [DONE]\n\n")
                self.wfile.flush()
                return
            except Exception as exc:
                body = json.dumps({"error": {"message": f"stream-bridge-decode-failed: {exc}"}}).encode()
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return

        self.send_response(res.status)
        for key, value in res.getheaders():
            lk = key.lower()
            if lk in {"connection", "content-length", "transfer-encoding", "content-encoding"}:
                continue
            self.send_header(key, value)
        self.send_header("Connection", "close")
        self.end_headers()

        while True:
            chunk = res.read(8192)
            if not chunk:
                break
            self.wfile.write(chunk)
            self.wfile.flush()
        conn.close()

    do_GET = _proxy
    do_POST = _proxy

class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == "__main__":
    print(f"Seven anonymous relay listening on http://{HOST}:{PORT}", flush=True)
    Server((HOST, PORT), Handler).serve_forever()

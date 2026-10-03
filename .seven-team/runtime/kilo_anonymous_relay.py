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
from urllib.parse import urlsplit

HOST = os.environ.get("SEVEN_RELAY_HOST", "127.0.0.1")
PORT = int(os.environ.get("SEVEN_RELAY_PORT", "8877"))
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
        # Intentionally DO NOT forward Authorization or any other caller headers.
        conn = http.client.HTTPSConnection(UPSTREAM, timeout=180)
        conn.request(self.command, PREFIX + target, body=payload, headers=headers)
        res = conn.getresponse()

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

#!/usr/bin/env python3
"""
mitm_9router.py - MITM Proxy Addon for 9Router interception.
Intercepts api.9router.com chat requests and forwards them to local MCP stdio.
"""

from mitmproxy import http, ctx
from mitmproxy.addonmanager import Loader
import json
import os
import select
import subprocess
from typing import Optional

MCP_SERVER_CMD = os.environ.get(
    "MCP_SERVER_CMD",
    "python3 /Users/AR135/Documents/GitHub/Front-RtRwNet/9router/router_agent.py",
)
TARGET_HOST = "api.9router.com"
ALLOWED_PATHS = ["/v1/chat/completions", "/v1/models", "/health"]

_mcp_process: Optional[subprocess.Popen] = None
_mcp_stdin = None
_mcp_stdout = None


def load(loader: Loader):
    ctx.log.info("🔌 9Router MITM addon loaded")
    ctx.log.info(f"MCP Server: {MCP_SERVER_CMD}")
    start_mcp_server()


def start_mcp_server():
    global _mcp_process, _mcp_stdin, _mcp_stdout

    if _mcp_process and _mcp_process.poll() is None:
        ctx.log.info("✅ MCP server already running")
        return

    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"

    _mcp_process = subprocess.Popen(
        MCP_SERVER_CMD.split(),
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        bufsize=0,
    )
    _mcp_stdin = _mcp_process.stdin
    _mcp_stdout = _mcp_process.stdout
    ctx.log.info("✅ MCP server started")


def request(flow: http.HTTPFlow):
    if flow.request.host != TARGET_HOST:
        return

    if not any(flow.request.path.startswith(path) for path in ALLOWED_PATHS):
        return

    ctx.log.info(f"🔍 Intercepted: {flow.request.method} {flow.request.url}")

    if flow.request.path != "/v1/chat/completions":
        return

    try:
        original_body = json.loads(flow.request.content)
        model = original_body.get("model", "kr/qwen3-coder-next")
        prompt = original_body.get("messages", [{}])[-1].get("content", "")

        response_content = call_mcp_tool("9router-chat", {"prompt": prompt, "model": model})
        fake_response = {
            "id": "mcp-fallback-" + os.urandom(8).hex(),
            "object": "chat.completion",
            "created": int(flow.request.timestamp_start),
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": response_content},
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": len(prompt) // 4,
                "completion_tokens": len(response_content) // 4,
                "total_tokens": len(prompt + response_content) // 4,
            },
        }

        flow.response = http.Response.make(
            200,
            json.dumps(fake_response).encode(),
            {"Content-Type": "application/json"},
        )
        ctx.log.info("✅ Response served from MCP fallback")
    except Exception as exc:
        ctx.log.error(f"❌ MCP fallback failed: {exc}")
        flow.response = http.Response.make(
            502,
            json.dumps({"error": f"MCP fallback failed: {exc}"}).encode(),
            {"Content-Type": "application/json"},
        )
        flow.response = http.Response.make(
            502,
            json.dumps({"error": f"MCP fallback failed: {exc}"}).encode(),
            {"Content-Type": "application/json"},
        )


def call_mcp_tool(tool_name: str, arguments: dict, timeout: int = 60) -> str:
    if not _mcp_stdin or not _mcp_stdout:
        raise RuntimeError("MCP server not initialized")

    mcp_message = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {"name": tool_name, "arguments": arguments},
    }

    _mcp_stdin.write((json.dumps(mcp_message) + "\n").encode())
    _mcp_stdin.flush()

    ready = select.select([_mcp_stdout], [], [], timeout)
    if not ready[0]:
        raise TimeoutError(f"MCP server did not respond within {timeout}s")

    response_line = _mcp_stdout.readline()
    response = json.loads(response_line.decode())

    if "error" in response:
        raise RuntimeError(response["error"].get("message", "MCP error"))

    return response.get("result", {}).get("content", [{}])[0].get("text", "")


def response(flow: http.HTTPFlow):
    if flow.request.host == TARGET_HOST and flow.response:
        ctx.log.info(f"📤 Response: {flow.response.status_code} - {len(flow.response.content)} bytes")


def done():
    if _mcp_process and _mcp_process.poll() is None:
        ctx.log.info("🛑 Shutting down MCP server...")
        _mcp_process.terminate()
        _mcp_process.wait(timeout=5)
        ctx.log.info("✅ MCP server stopped")

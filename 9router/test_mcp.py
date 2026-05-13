#!/usr/bin/env python3
"""
Valid MCP Server Test — simulates full JSON-RPC handshake
Usage: python3 test_mcp.py
"""

import asyncio
import json
import subprocess
import sys
import os

MCP_SERVER_PATH = os.path.join(os.path.dirname(__file__), "router_agent.py")
NINEROUTER_API_KEY = os.environ.get("NINEROUTER_API_KEY", "")

# ANSI colors
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"


def encode_message(payload: dict) -> bytes:
    """Encode JSON-RPC message with Content-Length header (MCP stdio protocol)"""
    body = json.dumps(payload)
    header = f"Content-Length: {len(body)}\r\n\r\n"
    return (header + body).encode()


async def read_message(reader: asyncio.StreamReader) -> dict | None:
    """Read one JSON-RPC message from stdout stream"""
    try:
        header_line = await asyncio.wait_for(reader.readline(), timeout=10.0)
        if not header_line:
            return None

        header = header_line.decode().strip()
        if not header.startswith("Content-Length:"):
            return None

        content_length = int(header.split(":")[1].strip())

        # Read blank line separator
        await reader.readline()

        # Read body
        body = await asyncio.wait_for(reader.readexactly(content_length), timeout=10.0)
        return json.loads(body)

    except asyncio.TimeoutError:
        print(f"{RED}✗ Timeout waiting for server response{RESET}")
        return None
    except Exception as e:
        print(f"{RED}✗ Error reading message: {e}{RESET}")
        return None


async def run_tests():
    print(f"\n{CYAN}{'='*55}")
    print("  9Router MCP Server — JSON-RPC Handshake Test")
    print(f"{'='*55}{RESET}\n")

    if not NINEROUTER_API_KEY:
        print(f"{YELLOW}⚠ NINEROUTER_API_KEY not set — tool call test will be skipped{RESET}\n")

    # Start MCP server subprocess
    env = os.environ.copy()
    proc = await asyncio.create_subprocess_exec(
        sys.executable, MCP_SERVER_PATH,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env=env
    )
    print(f"{GREEN}✓ MCP server process started (PID: {proc.pid}){RESET}")

    passed = 0
    failed = 0

    async def send(payload: dict, label: str) -> dict | None:
        nonlocal passed, failed
        print(f"\n{CYAN}[TEST] {label}{RESET}")
        print(f"  → Sending: {json.dumps(payload)[:120]}")
        proc.stdin.write(encode_message(payload))
        await proc.stdin.drain()
        response = await read_message(proc.stdout)
        if response:
            print(f"  ← Received: {json.dumps(response)[:120]}")
            passed += 1
        else:
            print(f"  {RED}← No response{RESET}")
            failed += 1
        return response

    # ── Step 1: initialize ──────────────────────────────────────
    init_response = await send({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test-client", "version": "1.0.0"}
        }
    }, "initialize handshake")

    if not init_response:
        print(f"\n{RED}✗ Server failed to respond to initialize. Aborting.{RESET}")
        proc.terminate()
        return

    # ── Step 2: initialized notification ───────────────────────
    proc.stdin.write(encode_message({
        "jsonrpc": "2.0",
        "method": "notifications/initialized"
    }))
    await proc.stdin.drain()
    print(f"\n{CYAN}[INFO] Sent initialized notification{RESET}")

    # ── Step 3: list tools ──────────────────────────────────────
    tools_response = await send({
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {}
    }, "tools/list")

    if tools_response:
        tools = tools_response.get("result", {}).get("tools", [])
        print(f"\n{GREEN}  Tools registered ({len(tools)}):{RESET}")
        for t in tools:
            print(f"    • {t['name']}")

    # ── Step 4: call tool — health check ───────────────────────
    await send({
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "9router-health",
            "arguments": {}
        }
    }, "tools/call → 9router-health")

    # ── Step 5: call tool — chat (only if API key is set) ──────
    if NINEROUTER_API_KEY:
        await send({
            "jsonrpc": "2.0",
            "id": 4,
            "method": "tools/call",
            "params": {
                "name": "9router-chat",
                "arguments": {
                    "prompt": "Reply with exactly: OK"
                }
            }
        }, "tools/call → 9router-chat")
    else:
        print(f"\n{YELLOW}[SKIP] 9router-chat — NINEROUTER_API_KEY not set{RESET}")

    # ── Result summary ──────────────────────────────────────────
    proc.terminate()
    await proc.wait()

    total = passed + failed
    print(f"\n{CYAN}{'='*55}{RESET}")
    print(f"  Results: {GREEN}{passed} passed{RESET} / {RED}{failed} failed{RESET} / {total} total")
    print(f"{CYAN}{'='*55}{RESET}\n")


if __name__ == "__main__":
    asyncio.run(run_tests())

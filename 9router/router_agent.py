#!/usr/bin/env python3
"""
9Router MCP Server - AI Model Routing Gateway
Uses model: kr/qwen3-coder-next by default
Optimized with httpx async HTTP client
"""

import asyncio
import json
import os
import time
import hashlib
import logging
import atexit
from typing import Any, List
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
    CallToolResult,
)
import httpx

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger("9router-mcp")

# 9Router Configuration
NINEROUTER_API_KEY = os.environ.get("NINEROUTER_API_KEY", "")
DEFAULT_MODEL = "kr/qwen3-coder-next"
MAX_PROMPT_LENGTH = 32_000

server = Server("9router-router-agent")

# Global async HTTP client with connection pooling
_http_client: httpx.AsyncClient | None = None
_client_lock: asyncio.Lock | None = None


def _get_or_create_lock() -> asyncio.Lock:
    """Get or create the client lock (must be called inside async context)"""
    global _client_lock
    if _client_lock is None:
        _client_lock = asyncio.Lock()
    return _client_lock


async def get_http_client() -> httpx.AsyncClient:
    """Singleton async HTTP client with connection pooling (thread-safe)"""
    global _http_client
    lock = _get_or_create_lock()
    async with lock:
        if _http_client is None or _http_client.is_closed:
            _http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(60.0, connect=10.0, read=30.0, write=10.0),
                limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
                follow_redirects=True
            )
    return _http_client


# Cleanup HTTP client on shutdown
@atexit.register
def cleanup_http_client():
    """Close HTTP client on server shutdown"""
    global _http_client
    if _http_client and not _http_client.is_closed:
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(_http_client.aclose())
            else:
                loop.run_until_complete(_http_client.aclose())
            logger.info("HTTP client closed")
        except Exception as e:
            logger.error(f"Error closing HTTP client: {e}")


# Response cache — ONLY for static/non-LLM endpoints
_response_cache: dict[str, tuple[str, float]] = {}
CACHE_TTL = 300  # 5 minutes

# Endpoints that are safe to cache (deterministic, non-LLM)
_CACHEABLE_ENDPOINTS = {
    "https://api.9router.com/v1/embeddings",
}


def _cache_key(endpoint: str, payload: dict) -> str:
    """Generate cache key from request parameters"""
    key_data = f"{endpoint}:{json.dumps(payload, sort_keys=True)}"
    return hashlib.sha256(key_data.encode()).hexdigest()


def _cleanup_expired_cache():
    """Remove all expired entries from cache"""
    now = time.time()
    expired_keys = [k for k, (_, ts) in _response_cache.items() if now - ts > CACHE_TTL]
    for k in expired_keys:
        del _response_cache[k]


async def _request(
    client: httpx.AsyncClient,
    url: str,
    json_payload: dict,
    headers: dict,
    use_cache: bool = False
) -> dict:
    """
    Execute HTTP POST request.
    Caching is opt-in and only for deterministic endpoints (e.g. embeddings).
    LLM and search endpoints are never cached.
    """
    if use_cache and url in _CACHEABLE_ENDPOINTS:
        key = _cache_key(url, json_payload)

        if key in _response_cache:
            cached_result, timestamp = _response_cache[key]
            if time.time() - timestamp < CACHE_TTL:
                logger.info(f"Cache hit for {url}")
                return json.loads(cached_result)

        response = await client.post(url, json=json_payload, headers=headers)
        response.raise_for_status()
        result = response.json()

        _response_cache[key] = (response.text, time.time())

        # Cleanup expired entries instead of just removing one
        if len(_response_cache) > 100:
            _cleanup_expired_cache()

        return result

    # Non-cacheable: direct request
    response = await client.post(url, json=json_payload, headers=headers)
    response.raise_for_status()
    return response.json()


# Pre-compiled tool metadata
_TOOLS_METADATA = [
    Tool(
        name="9router-chat",
        description="Send a chat message to 9Router AI gateway using kr/qwen3-coder-next model. Best for coding tasks.",
        inputSchema={
            "type": "object",
            "properties": {
                "prompt": {
                    "type": "string",
                    "description": "The user prompt/message to send to the AI model"
                },
                "model": {
                    "type": "string",
                    "description": "Model ID (default: kr/qwen3-coder-next)",
                    "default": DEFAULT_MODEL
                }
            },
            "required": ["prompt"]
        }
    ),
    Tool(
        name="9router-reasoning",
        description="Deep reasoning with DeepSeek-R1 model. Use for complex math, logic, and analysis tasks.",
        inputSchema={
            "type": "object",
            "properties": {
                "prompt": {
                    "type": "string",
                    "description": "Complex reasoning problem or analysis request"
                }
            },
            "required": ["prompt"]
        }
    ),
    Tool(
        name="9router-router-agent",
        description="Chat via 9Router gateway. Optimized async AI model routing.",
        inputSchema={
            "type": "object",
            "properties": {
                "prompt": {
                    "type": "string",
                    "description": "The user prompt/message"
                },
                "model": {
                    "type": "string",
                    "description": "Model ID",
                    "default": DEFAULT_MODEL
                }
            },
            "required": ["prompt"]
        }
    ),
    Tool(
        name="9router-health",
        description="Check 9Router API connectivity and latency. Returns status and response time.",
        inputSchema={
            "type": "object",
            "properties": {}
        }
    ),
    Tool(
        name="9router-web-search",
        description="Search the internet using 9Router's search capabilities with Gemini Flash.",
        inputSchema={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query"
                }
            },
            "required": ["query"]
        }
    ),
    Tool(
        name="9router-embeddings",
        description="Generate text embeddings using 9Router's embedding models.",
        inputSchema={
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "Text to generate embeddings for"
                }
            },
            "required": ["text"]
        }
    )
]


@server.list_tools()
async def list_tools() -> List[Tool]:
    """Return pre-compiled tool metadata - O(1) operation"""
    return _TOOLS_METADATA


def _validate_prompt(prompt: str, tool_name: str) -> CallToolResult | None:
    """
    Validate prompt length. Returns a CallToolResult error if invalid,
    or None if the prompt passes validation.
    """
    if len(prompt) > MAX_PROMPT_LENGTH:
        logger.warning(f"Prompt too long for {tool_name}: {len(prompt)} chars")
        return CallToolResult(
            content=[TextContent(
                type="text",
                text=f"Error: Prompt terlalu panjang ({len(prompt)} chars). Maksimum {MAX_PROMPT_LENGTH} chars."
            )],
            isError=True
        )
    return None


@server.call_tool()
async def call_tool(name: str, arguments: Any) -> CallToolResult:
    """Handle tool calls to 9Router - fully async with httpx"""
    start = time.time()
    logger.info(f"Tool call: {name}")

    # Check for API key
    if not NINEROUTER_API_KEY:
        logger.error("NINEROUTER_API_KEY not set")
        return CallToolResult(
            content=[TextContent(type="text", text="Error: NINEROUTER_API_KEY not set in environment")],
            isError=True
        )

    client = await get_http_client()
    headers = {
        "Authorization": f"Bearer {NINEROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        if name == "9router-health":
            # Health check tool
            start_ping = time.time()
            try:
                resp = await client.get("https://api.9router.com/models", headers=headers, timeout=5.0)
                resp.raise_for_status()
                latency = (time.time() - start_ping) * 1000
                logger.info(f"Health check OK - {latency:.0f}ms")
                return CallToolResult(content=[TextContent(
                    type="text",
                    text=f"✅ 9Router Healthy - Latency: {latency:.0f}ms - Status: {resp.status_code}"
                )])
            except httpx.HTTPStatusError as e:
                logger.error(f"Health check failed: HTTP {e.response.status_code}")
                return CallToolResult(
                    content=[TextContent(type="text", text=f"❌ Unhealthy: HTTP {e.response.status_code}")],
                    isError=True
                )
            except Exception as e:
                logger.error(f"Health check failed: {type(e).__name__}")
                return CallToolResult(
                    content=[TextContent(type="text", text=f"❌ Unhealthy: {type(e).__name__}")],
                    isError=True
                )

        elif name in ["9router-chat", "9router-router-agent"]:
            prompt = arguments.get("prompt", "")
            model = arguments.get("model", DEFAULT_MODEL)

            validation_error = _validate_prompt(prompt, name)
            if validation_error:
                return validation_error

            logger.info(f"Request: tool={name}, model={model}, prompt_len={len(prompt)}")

            # LLM responses are non-deterministic — never cache
            result = await _request(
                client,
                "https://api.9router.com/v1/chat/completions",
                {
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}]
                },
                headers,
                use_cache=False
            )

            content = result.get("choices", [{}])[0].get("message", {}).get("content", "No response")
            elapsed = time.time() - start
            logger.info(f"Completed {name} in {elapsed:.2f}s")
            return CallToolResult(content=[TextContent(type="text", text=content)])

        elif name == "9router-reasoning":
            prompt = arguments.get("prompt", "")

            validation_error = _validate_prompt(prompt, name)
            if validation_error:
                return validation_error

            logger.info(f"Reasoning request: prompt_len={len(prompt)}")

            # LLM responses are non-deterministic — never cache
            result = await _request(
                client,
                "https://api.9router.com/v1/chat/completions",
                {
                    "model": "deepseek/deepseek-reasoner",
                    "messages": [{"role": "user", "content": prompt}]
                },
                headers,
                use_cache=False
            )

            content = result.get("choices", [{}])[0].get("message", {}).get("content", "No response")
            elapsed = time.time() - start
            logger.info(f"Completed {name} in {elapsed:.2f}s")
            return CallToolResult(content=[TextContent(type="text", text=content)])

        elif name == "9router-web-search":
            query = arguments.get("query", "")
            logger.info(f"Web search: query_len={len(query)}")

            # Search results are time-sensitive — never cache
            result = await _request(
                client,
                "https://api.9router.com/v1/search",
                {"query": query, "model": "google/gemini-2.0-flash"},
                headers,
                use_cache=False
            )

            content = result.get("results", result)
            elapsed = time.time() - start
            logger.info(f"Search completed in {elapsed:.2f}s")
            return CallToolResult(content=[TextContent(type="text", text=json.dumps(content, indent=2))])

        elif name == "9router-embeddings":
            text = arguments.get("text", "")
            logger.info(f"Embeddings: text_len={len(text)}")

            # Embeddings are deterministic — safe to cache
            result = await _request(
                client,
                "https://api.9router.com/v1/embeddings",
                {"input": text, "model": "text-embedding-3-small"},
                headers,
                use_cache=True
            )

            elapsed = time.time() - start
            logger.info(f"Embeddings completed in {elapsed:.2f}s")
            return CallToolResult(content=[TextContent(type="text", text=json.dumps(result))])

        else:
            logger.warning(f"Unknown tool: {name}")
            return CallToolResult(
                content=[TextContent(type="text", text=f"Unknown tool: {name}")],
                isError=True
            )

    except httpx.HTTPStatusError as e:
        elapsed = time.time() - start
        logger.error(f"HTTP error after {elapsed:.2f}s: status={e.response.status_code}")
        return CallToolResult(
            content=[TextContent(type="text", text=f"Error: API returned HTTP {e.response.status_code}")],
            isError=True
        )
    except httpx.TimeoutException:
        elapsed = time.time() - start
        logger.error(f"Timeout after {elapsed:.2f}s")
        return CallToolResult(
            content=[TextContent(type="text", text="Error: Request timeout to 9Router API")],
            isError=True
        )
    except httpx.RequestError as e:
        elapsed = time.time() - start
        logger.error(f"Connection failed after {elapsed:.2f}s: {type(e).__name__}")
        return CallToolResult(
            content=[TextContent(type="text", text=f"Error: Connection failed - {type(e).__name__}")],
            isError=True
        )
    except Exception as e:
        elapsed = time.time() - start
        logger.error(f"Unexpected error after {elapsed:.2f}s: {type(e).__name__}: {e}")
        return CallToolResult(
            content=[TextContent(type="text", text=f"Error: {str(e)}")],
            isError=True
        )


async def main():
    """Main entry point for the MCP server"""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
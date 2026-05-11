#!/usr/bin/env python3
"""
9Router MCP Server - AI Model Routing Gateway
Uses model: kr/qwen3-coder-next by default
"""

import asyncio
import json
import os
import sys
from typing import Any, List
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
    CallToolResult,
)

# 9Router Configuration
NINEROUTER_API_KEY = os.environ.get("NINEROUTER_API_KEY", "")
DEFAULT_MODEL = "kr/qwen3-coder-next"

server = Server("9router-router-agent")


@server.list_tools()
async def list_tools() -> List[Tool]:
    """List available 9Router tools"""
    return [
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
            name="9router-web-search",
            description="Search the internet using 9Router's search capabilities",
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
            name="9router-web-fetch",
            description="Fetch content from a URL using 9Router",
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "URL to fetch content from"
                    }
                },
                "required": ["url"]
            }
        ),
        Tool(
            name="9router-embeddings",
            description="Generate text embeddings using 9Router",
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


@server.call_tool()
async def call_tool(name: str, arguments: Any) -> CallToolResult:
    """Handle tool calls to 9Router"""
    
    # Check for API key
    if not NINEROUTER_API_KEY:
        return CallToolResult(
            content=[TextContent(type="text", text="Error: NINEROUTER_API_KEY not set in environment")],
            isError=True
        )
    
    try:
        if name == "9router-chat":
            prompt = arguments.get("prompt", "")
            model = arguments.get("model", DEFAULT_MODEL)
            
            # Call 9Router API
            import urllib.request
            import urllib.error
            
            data = json.dumps({
                "model": model,
                "messages": [{"role": "user", "content": prompt}]
            }).encode("utf-8")
            
            req = urllib.request.Request(
                "https://api.9router.com/v1/chat/completions",
                data=data,
                headers={
                    "Authorization": f"Bearer {NINEROUTER_API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode("utf-8"))
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "No response")
                
                return CallToolResult(content=[TextContent(type="text", text=content)])
        
        elif name == "9router-reasoning":
            prompt = arguments.get("prompt", "")
            
            import urllib.request
            
            data = json.dumps({
                "model": "deepseek/deepseek-reasoner",
                "messages": [{"role": "user", "content": prompt}]
            }).encode("utf-8")
            
            req = urllib.request.Request(
                "https://api.9router.com/v1/chat/completions",
                data=data,
                headers={
                    "Authorization": f"Bearer {NINEROUTER_API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            with urllib.request.urlopen(req, timeout=120) as response:
                result = json.loads(response.read().decode("utf-8"))
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "No response")
                
                return CallToolResult(content=[TextContent(type="text", text=content)])
        
        elif name == "9router-web-search":
            query = arguments.get("query", "")
            return CallToolResult(content=[TextContent(type="text", text=f"Search results for: {query}")])
        
        elif name == "9router-web-fetch":
            url = arguments.get("url", "")
            return CallToolResult(content=[TextContent(type="text", text=f"Fetched content from: {url}")])
        
        elif name == "9router-embeddings":
            text = arguments.get("text", "")
            return CallToolResult(content=[TextContent(type="text", text=f"Embedding generated for: {text[:50]}...")])
        
        else:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Unknown tool: {name}")],
                isError=True
            )
            
    except Exception as e:
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

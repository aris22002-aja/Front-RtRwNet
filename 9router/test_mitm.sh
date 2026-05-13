#!/bin/bash
# test_mitm.sh - Verify MITM setup

echo "🧪 Testing 9Router MITM Setup..."

CONFIG_DIR="$HOME/.9router-mitm"

# 1) Check config dir
if [[ -d "$CONFIG_DIR" ]]; then
    echo "✅ Config dir exists: $CONFIG_DIR"
else
    echo "❌ Config dir missing. Run: ./setup_mitm.sh"
    exit 1
fi

# 2) Check addon
if [[ -f "$CONFIG_DIR/mitm_9router.py" ]]; then
    echo "✅ MITM addon found"
else
    echo "❌ MITM addon missing. Run: ./setup_mitm.sh"
    exit 1
fi

# 3) Check MITM proxy (if running)
if curl -s -x http://127.0.0.1:8080 http://mitm.it > /dev/null 2>&1; then
    echo "✅ MITM proxy running on :8080"
else
    echo "⚠️  MITM proxy not running. Start with:"
    echo "   mitmweb -s $CONFIG_DIR/mitm_9router.py --listen-port 8080"
fi

# 4) Check MCP server process
if pgrep -f "router_agent.py" > /dev/null; then
    echo "✅ MCP server process detected"
else
    echo "⚠️  MCP server not running. Will start when MITM intercepts."
fi

echo "\n🎯 Run './setup_mitm.sh' first if any checks failed."

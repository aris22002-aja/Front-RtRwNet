#!/bin/bash
# setup_mitm.sh - One-time setup for 9Router MITM Proxy (local-safe mode)
set -e

echo "🔧 Setting up 9Router MITM Proxy Environment..."

CONFIG_DIR="$HOME/.9router-mitm"
mkdir -p "$CONFIG_DIR/mitmproxy"

cp "$(dirname "$0")/mitm_9router.py" "$CONFIG_DIR/mitm_9router.py"

echo "✅ Addon copied to $CONFIG_DIR/mitm_9router.py"

echo "\n📌 Manual prerequisites (required on your machine):"
echo "1) Install mitmproxy in user-owned env"
echo "   Example: python3 -m venv ~/venv-mitm && source ~/venv-mitm/bin/activate && pip install mitmproxy"
echo "2) Ensure NINEROUTER_API_KEY exported"
echo "3) Start MITM manually:"
echo "   mitmweb -s $CONFIG_DIR/mitm_9router.py --mode reverse:http://localhost:20128 --listen-port 8080 --set confdir=$CONFIG_DIR/mitmproxy"

echo "\n⚠️ Optional system-level steps (not auto-run by script):"
echo "- /etc/hosts redirection: api.9router.com -> 127.0.0.1"
echo "- Trust mitmproxy CA cert generated in $CONFIG_DIR/mitmproxy"

echo "\n🎉 Setup files prepared."

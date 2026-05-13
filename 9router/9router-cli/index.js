#!/usr/bin/env node
/**
 * 9Router CLI - Simple command-line interface for 9Router API
 * Usage: 9router-cli chat "Your prompt here" --model kr/qwen3-coder-next
 */
require('dotenv').config();
const { program } = require('commander');
const fetch = require('node-fetch');
const readline = require('readline');

const API_BASE = process.env.NINEROUTER_API_BASE || 'https://api.together.xyz/v1';
const API_KEY = process.env.NINEROUTER_API_KEY;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};
// tgp_v1_5j3r51VvKnyXo2JozyQsIcGWGRBjWfzkdTPZbw3d5fM
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureApiKey() {
  if (!API_KEY) {
    log('Error: Please set NINEROUTER_API_KEY environment variable', 'red');
    process.exit(1);
  }
}

async function interactiveChat(model) {
  ensureApiKey();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n🤖 You: ',
  });

  log(`\n✨ 9Router Chat Mode (Model: ${model})`, 'green');
  log('Type "exit" or "quit" to end session\n', 'yellow');

  const history = [];
  rl.prompt();

  for await (const line of rl) {
    const prompt = line.trim();

    if (['exit', 'quit', '.exit'].includes(prompt.toLowerCase())) {
      log('\n👋 Goodbye!', 'green');
      rl.close();
      break;
    }

    if (!prompt) {
      rl.prompt();
      continue;
    }

    try {
      log('\n⏳ Thinking...', 'yellow');

      const content = await requestChat([...history, { role: 'user', content: prompt }], model);

      history.push({ role: 'user', content: prompt });
      history.push({ role: 'assistant', content });
      if (history.length > 10) history.splice(0, 2);

      log('\n🤖 9Router:', 'cyan');
      log(content + '\n', 'green');
    } catch (error) {
      log(`\n❌ Error: ${error.message}\n`, 'red');
    }

    rl.prompt();
  }
}

// Proxy support for MITM (optional - works without it)
let fetchOptions = {};
try {
  const { HttpsProxyAgent } = require('https-proxy-agent');
  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  if (proxyUrl) {
    fetchOptions = { agent: new HttpsProxyAgent(proxyUrl) };
  }
} catch (e) {
  // https-proxy-agent not installed - direct connection only
}

async function requestChat(messages, model) {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    ...fetchOptions,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      detail = error.error?.message || detail;
    } catch (_) { }
    throw new Error(detail);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function singlePrompt(prompt, model) {
  ensureApiKey();

  if (!prompt) {
    log('Error: Prompt is required', 'red');
    process.exit(1);
  }

  try {
    const content = await requestChat([{ role: 'user', content: prompt }], model);
    process.stdout.write(content);
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

program
  .name('9router-cli')
  .description('Command-line interface for 9Router AI Gateway')
  .version('1.0.0');

program
  .command('chat [prompt]')
  .description('Chat with 9Router AI interactive or single prompt')
  .option('-m, --model <model>', 'Model ID', 'kr/qwen3-coder-next')
  .option('-i, --interactive', 'Force interactive mode', false)
  .option('--stdin', 'Read JSON payload from stdin', false)
  .action(async (prompt, options) => {
    if (options.stdin || process.env.MCP_FALLBACK_MODE) {
      let input = '';
      process.stdin.on('data', chunk => (input += chunk));
      process.stdin.on('end', async () => {
        const payload = JSON.parse(input.trim());
        await singlePrompt(payload.prompt, payload.model || options.model);
      });
      return;
    }

    if (options.interactive || !prompt) {
      await interactiveChat(options.model);
      return;
    }

    await singlePrompt(prompt, options.model);
  });

program
  .command('models')
  .description('List known models')
  .action(() => {
    log('\n📦 Available Models:', 'green');
    log('  • kr/qwen3-coder-next - Coding & technical tasks (default)');
    log('  • kr/claude-sonnet-4.5 - Claude model via 9Router');
    log('  • deepseek/deepseek-reasoner - Complex reasoning & analysis');
    log('  • More models at: https://9router.com/models\n');
  });

program
  .command('health')
  .description('Check API connectivity')
  .action(async () => {
    ensureApiKey();

    try {
      const start = Date.now();
      const response = await fetch(`${API_BASE}/models`, {
        ...fetchOptions,
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      const latency = Date.now() - start;

      if (response.ok) {
        log(`✅ API Healthy - Latency: ${latency}ms`, 'green');
      } else {
        log(`⚠️ API Responded with HTTP ${response.status}`, 'yellow');
      }
    } catch (error) {
      log(`❌ API Unreachable: ${error.message}`, 'red');
      process.exit(1);
    }
  });
// Tambahkan debug logging sementara
console.error('🔍 Debug:', {
  envPath: require('path').resolve(__dirname, '..', '..', '.env'),
  keyLoaded: !!process.env.TOGETHER_API_KEY,
  keyPrefix: process.env.TOGETHER_API_KEY?.slice(0, 15)
});
program.parse(process.argv);

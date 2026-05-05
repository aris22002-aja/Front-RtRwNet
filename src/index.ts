export interface Env {
  BACKEND: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle Preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (url.pathname.startsWith('/api/') || url.pathname === '/health') {
      try {
        const response = await env.BACKEND.fetch(request);
        
        // Headers are often immutable, so we create a new response
        const newHeaders = new Headers(response.headers);
        const origin = request.headers.get('Origin');
        
        if (origin) {
          newHeaders.set('Access-Control-Allow-Origin', origin);
          newHeaders.set('Access-Control-Allow-Credentials', 'true');
        } else {
          newHeaders.set('Access-Control-Allow-Origin', '*');
        }
        
        newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Backend connection failed' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return fetch(request);  // Static asset handler
  }
};
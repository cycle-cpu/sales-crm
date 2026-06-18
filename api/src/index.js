// Standalone Cloudflare Worker — shared CRM state in KV.
// The frontend lives on GitHub Pages (different origin), so we send CORS headers.
// Bindings required:
//   KV namespace -> binding name: CRM
//   Secret       -> CRM_PASSCODE (the shared access code)
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'X-Passcode, Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...CORS } });

    // gate every request on the shared passcode
    const given = request.headers.get('X-Passcode') || '';
    if (!env.CRM_PASSCODE || given !== env.CRM_PASSCODE) return json({ error: 'unauthorized' }, 401);

    if (request.method === 'GET') {
      const raw = await env.CRM.get('state');
      return new Response(raw || JSON.stringify({ data: [], owners: ['Me', 'Partner'], updated: 0 }),
        { headers: { 'content-type': 'application/json', ...CORS } });
    }

    if (request.method === 'PUT') {
      const body = await request.text();
      try { JSON.parse(body); } catch { return json({ error: 'bad json' }, 400); }
      await env.CRM.put('state', body);
      return json({ ok: true });
    }

    return json({ error: 'method not allowed' }, 405);
  },
};

export const runtime = 'edge';   // 告訴 Vercel 用 Edge Runtime

export default async function handler(req) {
  // 0. CORS 預檢
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: cors()
    });
  }

  // 1. 組目標 URL
  const src = new URL(req.url);
  const target = new URL('https://generativelanguage.googleapis.com/v1beta' + src.pathname.replace(/^\/api\/gemini/, ''));
  target.search = src.search;                    // 保留使用者 querystring
  target.searchParams.set('key', process.env.GEMINI_KEY);  // 注入金鑰

  // 2. 轉送
  const resp = await fetch(target.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  const headers = new Headers(resp.headers);
  cors(headers);                                 // 補 CORS
  return new Response(resp.body, { status: resp.status, headers });
}

function cors(h = new Headers()) {
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return h;
}
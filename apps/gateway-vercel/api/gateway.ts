import { geolocation } from '@vercel/functions';

export const config = { runtime: 'edge' };

const EU = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT',
  'LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','NO','LI' // 含 EEA
]);

function pickRegion(req: Request): 'eu' | 'us' {
  // 允许外部强制：X-User-Geo: eu|us（便于测试/灰度）
  const forced = (req.headers.get('x-user-geo') || '').toLowerCase();
  if (forced === 'eu' || forced === 'us') return forced as 'eu' | 'us';

  // Vercel 提供的地理信息（Edge Functions/中间件均可用）
  // 也可直接读头：x-vercel-ip-country / x-vercel-ip-country-region / x-vercel-ip-city
  const g = geolocation(req);
  const country = (g.country || req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  return EU.has(country) ? 'eu' : 'us';
}

function corsHeaders(origin: string | null) {
  const o = (process.env.ALLOWED_ORIGINS || '*') === '*' ? '*' : (origin || '');
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-User-Geo',
    'Access-Control-Max-Age': '600'
  };
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  // 由于 vercel.json 把所有路径重写到 /api/gateway，这里把原始路径还原为根路径
  const origPath = url.pathname.replace(/^\/api\/gateway$/, '') || '/';
  const targetRegion = pickRegion(req);
  const base = targetRegion === 'eu'
    ? (process.env.RENDER_EU_ORIGIN as string)
    : (process.env.RENDER_US_ORIGIN as string);

  // 预检 CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req.headers.get('origin')) });
  }

  const target = new URL(base);
  target.pathname = origPath;
  target.search = url.search;

  // 透传请求（保持流式），去掉 Host，补充标识头
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.set('x-ea-gateway', 'vercel-edge');
  headers.set('x-user-geo', targetRegion);

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ['GET','HEAD'].includes(req.method) ? undefined : req.body
  };

  const res = await fetch(target.toString(), init);

  // 透传响应并追加 CORS
  const outHeaders = new Headers(res.headers);
  const ch = corsHeaders(req.headers.get('origin'));
  Object.entries(ch).forEach(([k,v]) => outHeaders.set(k, v));

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: outHeaders
  });
}

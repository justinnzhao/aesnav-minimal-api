module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (!auth(req, res)) return;
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  let body = await readJson(req);
  body = normalizeCozeBody(body);

  const base = process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`;
  const url = `${base}/api/v1/report/demo?title=${encodeURIComponent('AesNav Report')}`;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify({ ok:true, pdf_url: url, echo: { has_report: !!body.report } }));
};

function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');}
function auth(req,res){const ok=process.env.AUTH_TOKEN&&req.headers.authorization===`Bearer ${process.env.AUTH_TOKEN}`;if(!ok){res.statusCode=401;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify({ok:false,err_code:'401_UNAUTHORIZED',err_msg:'invalid token'}));}return ok;}
async function readJson(req){if(req.body&&typeof req.body!=='string')return req.body;const chunks=[];for await(const c of req)chunks.push(c);const raw=Buffer.concat(chunks).toString('utf8')||'{}';try{return JSON.parse(raw);}catch{return {};}}
function normalizeCozeBody(b){
  if (b && typeof b.body === 'string') { try { b = JSON.parse(b.body); } catch {} }
  else if (b && b.body && typeof b.body === 'object') { b = b.body; }
  if (b && typeof b.report === 'string') {
    try { b.report = JSON.parse(b.report); } catch {}
  }
  return b || {};
}

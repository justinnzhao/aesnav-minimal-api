module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (!auth(req, res)) return;
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  const body = await readJson(req);
  const allowed = new Set(['nose','jawline','chin','midface','eyelids','brow','neck']);
  if (!body.image || !allowed.has(body.region)) {
    res.statusCode = 422;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    return res.end(JSON.stringify({ ok:false, err_code:'422_SCHEMA_INVALID', err_msg:'image or region invalid' }));
  }

  // 占位：返回示意图 URL（可换成你 CDN/对象存储）
  const simulated_image_url = 'https://placehold.co/640x800/png?text=AI+Simulation';
  const payload = { ok:true, simulated_image_url, changes: ['radix +10%','tip rotation +3°'], watermark: true };

  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
};

// helpers
function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');}
function auth(req,res){const ok=process.env.AUTH_TOKEN&&req.headers.authorization===`Bearer ${process.env.AUTH_TOKEN}`;if(!ok){res.statusCode=401;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify({ok:false,err_code:'401_UNAUTHORIZED',err_msg:'invalid token'}));}return ok;}
async function readJson(req){if(req.body&&typeof req.body!=='string')return req.body;const chunks=[];for await(const c of req)chunks.push(c);const raw=Buffer.concat(chunks).toString('utf8')||'{}';try{return JSON.parse(raw);}catch{return {};}}

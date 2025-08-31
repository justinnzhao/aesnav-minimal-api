const PDFDocument = require('pdfkit'); // keep as dependency reference

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (!auth(req, res)) return;
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  let body = await readJson(req);
  body = normalizeCozeBody(body); // <— 兼容 Coze 传参

  const images = Array.isArray(body.images) ? body.images : [];
  if (images.length === 0) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ ok: false, err_code: '400_BAD_INPUT', err_msg: 'images must be non-empty' }));
  }

  const payload = {
    ok: true,
    capture_quality: {
      lighting: 0.91,
      sharpness: 0.87,
      beautify_detected: false,
      views_present: images.map(i => i.view).filter(Boolean)
    },
    metrics: {
      proportions: { thirds: { upper: 0.96, middle: 1.01, lower: 1.03 } },
      nose: { nasofrontal: 122.4, nasolabial: 98.3, dorsal_continuity: false },
      jaw: { mandibular: 131.2 },
      chin: { eline_upper_mm: -2.8 },
      eyes: { upper_eyelid_show: 'low' }
    },
    confidence: { overall: 0.82 },
    findings: [{ id: 'low_radix', evidence: ['nasofrontal<=125', 'dorsal_discontinuity'] }],
    suggestion_cards: [
      {
        id: 'low_radix',
        options: [
          { type: 'micro', name: '透明质酸隆鼻', invasiveness: 'low', downtime: '1–3天', maintenance: '6–12个月', risks: ['淤青', '血管风险（罕见）'] },
          { type: 'surgery', name: '结构支撑鼻综合', invasiveness: 'high', downtime: '1–2周', risks: ['出血', '感染', '不对称'] }
        ],
        consultation_priority: 'recommended'
      }
    ],
    disclaimers: ['教育用途，非医疗建议']
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
};

// —— helpers ——
function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');}
function auth(req,res){const ok=process.env.AUTH_TOKEN&&req.headers.authorization===`Bearer ${process.env.AUTH_TOKEN}`;if(!ok){res.statusCode=401;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify({ok:false,err_code:'401_UNAUTHORIZED',err_msg:'invalid token'}));}return ok;}
async function readJson(req){if(req.body&&typeof req.body!=='string')return req.body;const chunks=[];for await(const c of req)chunks.push(c);const raw=Buffer.concat(chunks).toString('utf8')||'{}';try{return JSON.parse(raw);}catch{return {};}}
function normalizeCozeBody(b){
  // 兼容 {"body":"{...}"} 或 {"body":{...}}
  if (b && typeof b.body === 'string') { try { b = JSON.parse(b.body); } catch {} }
  else if (b && b.body && typeof b.body === 'object') { b = b.body; }

  // 兼容 images 为字符串 JSON
  if (b && typeof b.images === 'string') {
    try { const parsed = JSON.parse(b.images); if (Array.isArray(parsed)) b.images = parsed; } catch {}
  }
  return b || {};
}

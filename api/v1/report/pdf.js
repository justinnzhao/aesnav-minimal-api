module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (!auth(req, res)) return;
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  const base = process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`;
  const url = `${base}/api/v1/report/demo?title=${encodeURIComponent('AesNav Report')}`;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify({ ok:true, pdf_url: url }));
};

// helpers
function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');}
function auth(req,res){const ok=process.env.AUTH_TOKEN&&req.headers.authorization===`Bearer ${process.env.AUTH_TOKEN}`;if(!ok){res.statusCode=401;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify({ok:false,err_code:'401_UNAUTHORIZED',err_msg:'invalid token'}));}return ok;}

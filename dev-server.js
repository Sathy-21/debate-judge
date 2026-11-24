// Local development without the Vercel CLI:  node dev-server.js
// Reads ANTHROPIC_API_KEY (and optional APP_PASSCODE, MODEL) from the environment or a .env file.
const http = require('http');
const fs = require('fs');
const path = require('path');

try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const judge = require('./api/judge');
const port = process.env.PORT || 3000;

http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/judge')) {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try { req.body = raw ? JSON.parse(raw) : null; } catch { req.body = null; }
    res.status = code => { res.statusCode = code; return res; };
    res.json = obj => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(obj)); };
    return judge(req, res);
  }
  res.setHeader('content-type', 'text/html; charset=utf-8');
  fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
}).listen(port, () => console.log(`Debate Judge running at http://localhost:${port}`));

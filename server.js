const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const RANKING_FILE = path.join(__dirname, 'ranking.txt');

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.mp3': return 'audio/mpeg';
    case '.wav': return 'audio/wav';
    default: return 'application/octet-stream';
  }
}

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath.replace(/^\//, ''));

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

function handleSaveRanking(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const item = JSON.parse(body);
      // read existing ranking
      fs.readFile(RANKING_FILE, 'utf8', (err, data) => {
        let ranking = [];
        if (!err) {
          try { ranking = JSON.parse(data); } catch(e) { ranking = []; }
        }
        ranking.push(item);
        ranking.sort((a,b) => (b.score || 0) - (a.score || 0));
        fs.writeFile(RANKING_FILE, JSON.stringify(ranking, null, 2), 'utf8', (werr) => {
          if (werr) {
            res.writeHead(500);
            res.end('Failed to write ranking');
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
          }
        });
      });
    } catch (e) {
      res.writeHead(400);
      res.end('Invalid JSON');
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save-ranking') {
    handleSaveRanking(req, res);
    return;
  }

  if (req.method === 'GET') {
    // expose ranking.txt as plain text (JSON content)
    if (req.url === '/ranking.txt') {
      fs.readFile(RANKING_FILE, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('[]');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      });
      return;
    }

    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const MIME = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml' };
const TEXT = ['.html','.js','.css','.json','.txt','.svg'];

http.createServer((req, res) => {
    let filePath = '.' + decodeURIComponent(req.url.split('?')[0]);
    if (filePath === './') filePath = './index.html';
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ct = (MIME[ext] || 'text/plain') + (TEXT.includes(ext) ? '; charset=utf-8' : '');
        res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'no-cache' });
        res.end(data);
    });
}).listen(PORT, () => console.log('http://localhost:' + PORT));
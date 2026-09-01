const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;
const MIME = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml' };
const TEXT = ['.html','.js','.css','.json','.txt','.svg'];

http.createServer((req, res) => {
    let requestPath;
    try {
        requestPath = decodeURIComponent(req.url.split('?')[0]);
    } catch (error) {
        res.writeHead(400);
        res.end('Bad request');
        return;
    }

    if (requestPath === '/') requestPath = '/index.html';
    const filePath = path.resolve(ROOT, requestPath.replace(/^[/\\]+/, ''));
    const relativePath = path.relative(ROOT, filePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const ct = (MIME[ext] || 'text/plain') + (TEXT.includes(ext) ? '; charset=utf-8' : '');
        res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'no-cache' });
        res.end(data);
    });
}).listen(PORT, () => console.log('http://localhost:' + PORT));

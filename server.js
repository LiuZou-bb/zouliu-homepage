const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8080);
const ROOT = __dirname;
const MIME = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm' };
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
        const headers = { 'Content-Type': ct, 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes' };
        if (req.headers.range) {
            const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
            let start = range && range[1] ? Number(range[1]) : 0;
            let end = range && range[2] ? Number(range[2]) : data.length - 1;
            if (range && !range[1] && range[2]) {
                start = Math.max(0, data.length - Number(range[2]));
                end = data.length - 1;
            }
            if (!range || (!range[1] && !range[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= data.length || end < start || (!range[1] && Number(range[2]) === 0)) {
                res.writeHead(416, { ...headers, 'Content-Range': 'bytes */' + data.length });
                res.end();return;
            }
            end = Math.min(end, data.length - 1);
            res.writeHead(206, { ...headers, 'Content-Range': 'bytes ' + start + '-' + end + '/' + data.length, 'Content-Length': end - start + 1 });
            res.end(req.method === 'HEAD' ? undefined : data.subarray(start, end + 1));return;
        }
        res.writeHead(200, { ...headers, 'Content-Length': data.length });
        res.end(req.method === 'HEAD' ? undefined : data);
    });
}).listen(PORT, '127.0.0.1', () => console.log('http://127.0.0.1:' + PORT));

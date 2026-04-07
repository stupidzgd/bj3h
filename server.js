const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 3000;
const rootDir = '/www/wwwroot/bj3h/build';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let url = req.url;
  
  // API 代理到后端 (关键部分)
  if (url.startsWith('/prod-api/')) {
    const targetPath = url.replace('/prod-api', '');
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: targetPath,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    req.pipe(proxyReq);
    return;
  }
  
  // 静态资源路径处理
  if (url.startsWith('/react-antd-admin-template/')) {
    url = url.replace('/react-antd-admin-template', '');
  }
  
  if (url === '/') {
    url = '/index.html';
  }
  
  let filePath = path.join(rootDir, url);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(rootDir, 'index.html'), (err, content) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, () => console.log('Server running on port ' + port));
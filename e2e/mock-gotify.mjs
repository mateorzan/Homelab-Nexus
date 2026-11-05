import http from 'node:http';

const now = Date.now();
const messages = [
  { id: 11, appid: 1, title: 'Background job failed', message: 'A scheduled sample job returned an error', priority: 9, date: now - 60_000 },
  { id: 12, appid: 1, title: 'Host unavailable', message: 'Sample host-01 is not responding', priority: 8, date: now - 300_000 },
  { id: 13, appid: 1, title: 'Info normal', message: 'Mensaje informativo', priority: 3, date: now - 900_000 },
];

http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname === '/application') {
    res.end(JSON.stringify([{ id: 1, name: 'Operations', description: '' }]));
  } else if (url.pathname === '/message') {
    res.end(JSON.stringify({ messages }));
  } else {
    res.statusCode = 404;
    res.end('{}');
  }
}).listen(9999, '127.0.0.1', () => console.log('mock gotify en :9999'));

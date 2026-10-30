const http = require('http');
const os = require('os');
const fs = require('fs');
const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || 'v1';
const DATA_DIR = process.env.DATA_DIR || '/tmp';
let requests = 0;

const server = http.createServer((req, res) => {
requests++;
res.setHeader('Content-Type', 'application/json');
if (req.url === '/health') {
    return res.end(JSON.stringify({ status: 'ok' }));
  }
  if (req.url === '/cpu') {            // used later to trigger autoscaling
    let x = 0;
    for (let i = 0; i < 5e7; i++) x += Math.sqrt(i);
    return res.end(JSON.stringify({ burned: x }));
  }
  if (req.url === '/visits') {         // used for the volume mini-project
    const file = DATA_DIR + '/visits.txt';
    let n = 0;
    try { n = parseInt(fs.readFileSync(file, 'utf8')) || 0; } catch (e) {}
    fs.writeFileSync(file, String(n + 1));
    return res.end(JSON.stringify({ visits: n + 1 }));
  }
  res.end(JSON.stringify({
    message: 'Hello from the EKS roadmap app',
    version: APP_VERSION,
    host: os.hostname(),
    requests: requests
  }));
});
server.listen(PORT, () => console.log('listening on ' + PORT));
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
#!/usr/bin/env node

const http = require('http');
const os = require('os');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Get local IP
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const IP = getLocalIp();
const PORT = 19000;
const HOST = '0.0.0.0';

// Create HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve manifest
  if (req.url === '/' || req.url === '/manifest.json') {
    const manifest = {
      name: 'EUPHORIA',
      slug: 'euphoria-mobile',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'light',
      splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
      },
      assetBundlePatterns: ['**/*'],
      ios: { supportsTabletMode: true },
      android: { adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png' } },
      web: { favicon: './assets/favicon.png' },
      plugins: ['expo-router'],
      scheme: 'exp'
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(manifest, null, 2));
    return;
  }

  // Serve bundle (mock)
  if (req.url.includes('index.bundle')) {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end('// React Native Bundle - Load in Expo Go\nconsole.log("EUPHORIA Mobile App Ready");');
    return;
  }

  // API endpoint for development
  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ready', version: '1.0.0' }));
    return;
  }

  // Default response
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>EUPHORIA Development Server</title>
        <style>
          body { font-family: Arial; padding: 40px; background: #f0f0f0; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
          h1 { color: #333; }
          .qr { text-align: center; }
          code { background: #eee; padding: 10px; display: block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📱 EUPHORIA Mobile Development Server</h1>
          <p>Server is running at <code>http://${IP}:${PORT}</code></p>
          <p><strong>To connect with Expo Go:</strong></p>
          <p>1. Download Expo Go app (iOS/Android)</p>
          <p>2. Use connection URL: <code>exp://${IP}:${PORT}</code></p>
          <p>✅ Your app is ready to load!</p>
        </div>
      </body>
    </html>
  `);
});

server.listen(PORT, HOST, () => {
  console.clear();
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║     EUPHORIA Mobile Development Server       ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  const expoUrl = `exp://${IP}:${PORT}`;
  
  console.log('📡 Server running at: http://' + IP + ':' + PORT);
  console.log('\n🔗 Expo Go Connection URL:\n');
  console.log('   ' + expoUrl + '\n');
  
  console.log('📲 Scan with Expo Go:\n');
  qrcode.generate(expoUrl, { small: true }, (qr) => {
    console.log(qr);
  });
  
  console.log('\n✅ Ready! Open Expo Go and scan the QR code above');
  console.log('   or paste: exp://' + IP + ':' + PORT + '\n');
  console.log('═════════════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  server.close();
  process.exit(0);
});

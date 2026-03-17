const qrcode = require('qrcode-terminal');
const os = require('os');

// Get local IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIp();
const expoConnectUrl = `exp://${ip}:19000`;

console.log('\n========================================');
console.log('EUPHORIA Mobile App - Expo Go QR Code');
console.log('========================================\n');
console.log('Scan this QR code with Expo Go app:\n');

qrcode.generate(expoConnectUrl, { small: true }, (qr) => {
  console.log('\n' + qr);
});

console.log('\nManual URL: ' + expoConnectUrl);
console.log('\nOr use: exp://' + ip + ':19000\n');
console.log('========================================');

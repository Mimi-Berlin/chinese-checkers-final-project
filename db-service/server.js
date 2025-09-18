const http = require('http');
const app = require('./App');
const WebSocket = require('ws');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 לקוח התחבר');
  
  ws.on('message', (message) => {
    console.log(' קיבלתי:', message);
    // אפשרות לשלוח את ההודעה הלאה ל-C++ או לשחקנים אחרים
  });

  ws.on('close', () => {
    console.log('❌ לקוח התנתק');
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(` השרת רץ על פורט ${PORT}`);
});

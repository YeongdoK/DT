// server.js
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', socket => {
    socket.on('message', message => {
        // 메시지를 JSON 형식으로 파싱
        const data = JSON.parse(message);
        
        // 메시지를 다시 문자열로 변환하여 모든 클라이언트에 전송
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ user: data.user, message: data.message }));
            }
        });
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

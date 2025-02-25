import { WebSocketServer } from "ws";

const PORT = 4002;
const server = new WebSocketServer({ port: PORT });
let sockets: any[] = [];

server.on('connection', function(socket) {
    sockets.push(socket);

    socket.on('message', function(msg) {
      console.log('>', String(msg));
      sockets.forEach(s => {
        if(s != this)
          s.send(msg)
      });
    });
    
    socket.on('close', function() {
      sockets = sockets.filter(s => s !== socket);
    });
});


console.log(`Server iniciado na porta ${server.address().port} ...`);
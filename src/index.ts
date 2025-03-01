import { WebSocketServer } from "ws";

const PORT = 4002;
const server = new WebSocketServer({ port: PORT });
let sockets: any[] = [];
let COUNT = 0;

const players:Map<number, PlayerStatus> = new Map();

server.on('connection', function(socket) {
    const ID = COUNT++;
    sockets.push(socket);

    socket.on('message', function(msg) {
      const message = String(msg)
      //console.log('>', message);

      const json = JSON.parse(message);   
      console.log('>', json)   
      switch(json.action) {
        case 'CREATE':
          const status_:PlayerStatus = {
            id: json.id,
            character: json.character,
            position: json.position,
            tile: json.tile
          }
          console.log("PlayerStatus", status_)
          players.set(json.id, status_);
          break;
        case 'MOVE':
          const status:PlayerStatus|undefined = players.get(json.id);
          if(status) {
            status.tile = json.path[json.path.length - 1];
            status.position = null
            players.set(json.id, status);
          }
        break;
      }



      sockets.forEach(s => {
        if(s != this) s.send(message)
      });
    });
    
    socket.on('close', function() {
      const status = players.delete(ID);
      sockets = sockets.filter(s => s !== socket);
      sockets.forEach(socket => socket.send(JSON.stringify({ action: 'REMOVE', id: ID })));
    });

    sendID(socket, ID);
});

async function sendID(socket:any, id:number) {
  const array:PlayerStatus[] = []

  players.forEach(v => array.push(v));
  console.log("players_", array);

  socket.send(JSON.stringify({
    action: 'SERVER',
    id: id,
    players: array
  }));  
}




console.log(`Server iniciado na porta ${server?.address()} ...`);

interface PlayerStatus {
  id:number,
  character:string,
  position: {x:number, y:number, z:number}|null
  tile: number|null
}
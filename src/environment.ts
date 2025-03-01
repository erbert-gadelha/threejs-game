const development:Environment = {
    production: false,
    //WEBSOCKET_URI: "ws://localhost:4002",
    WEBSOCKET_URI: "https://threejs-game-production.up.railway.app",
}
const production:Environment = {
    production: true,
    WEBSOCKET_URI: "https://threejs-game-production.up.railway.app",
}



interface Environment {
    production:boolean,
    WEBSOCKET_URI:string
}



export default process.env.NODE_ENV=='production'?production:development;

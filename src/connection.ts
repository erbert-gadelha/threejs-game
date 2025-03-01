//import WebSocket from 'ws';

import { Vector3 } from "three";
import Player from "./player";
import environment from "./environment";




export class Connection {
    private client:WebSocket;
    private ID:number = -1;
    private static connection:Connection;
    private messageQueue:string[] = [];
    private isConnected:boolean = false;
    public handleMessage = (message: any) => {
        console.log(message)        
    };

    constructor() {
        console.log(`webSocket_url "${environment.WEBSOCKET_URI}"`);
        this.client = new WebSocket(environment.WEBSOCKET_URI);
    
        this.client.onopen = (/*ev:Event*/) => {
            this.client.onmessage = this.handleMessage_;
            this.onConnection(/*ev*/);
        };

        if(!Connection.connection)
            Connection.connection = this;
    }


    private onConnection(/*ev:Event*/) {
        this.isConnected = true;
        this.messageQueue.forEach((message:string) => this.send(message));
    }


    public send(message:any) {
        if(this.isConnected){
            const message_ = JSON.stringify({
                ...{id: this.ID},
                ...message
            });

            console.log("send", message_)
            this.client.send(message_);
        } else
            this.messageQueue.push(message);
    }



    public createCharacter(character:string, position:Vector3):void {
        console.log("connection-position", position);
        this.send({ action: 'CREATE', character : character, position:position });
    }

    public changeCharacter(new_character:string, new_position:Vector3):void {
        this.send({ action: 'CHANGE', character : new_character, position :new_position });
    }
    
    public removeCharacter():void {
        this.send({ action: 'REMOVE' });
    }



    private async handleMessage_ (/*this_: WebSocket, */ ev: MessageEvent<any>) {
        const message:{id:number, action:string, character:string, position: Vector3, players:any[], tile:number, path:number[]} = JSON.parse(ev.data)
        console.log("message", message)

        switch (message.action) {
            case "SERVER":
                Connection.getInstance().ID = message.id;
                setTimeout(()=>
                    message.players.forEach((enemy:EnemyInfo) => Player.newEnemy(enemy.id, enemy.character, enemy.position, enemy.tile)),
                500);

                console.warn('MY-ID', message.id);
                break;
            case "CREATE":
                console.log("handleMessage-position", message.position)
                Player.newEnemy(message.id, message.character, message.position, message.tile)
                break;
            case "MOVE":
                Player.moveEnemy(message.id,  message.path)
                break;
            case "CHANGE":

            console.log(`mudar boneco de id(${message.id}) para (${message.character})`); break;
            case "REMOVE":
                Player.removeEnemy(message.id); break;
        }

    };

    

    /*public sendMessage(message:object):void {
        this.send(
            JSON.stringify({
                ...{id: this.ID},
                ...message
            })
        );
    }*/

    public static getInstance():Connection {
        if(Connection.connection)
            return Connection.connection;
        else
            throw Error("Não há instancias de Connection");
    }







}


interface EnemyInfo {
    id:number,
    character:string,
    position: Vector3,
    tile:number
}
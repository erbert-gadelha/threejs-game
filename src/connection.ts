//import WebSocket from 'ws';

import { Vector3 } from "three";
import Player from "./player";

export class Connection {
    private client:WebSocket;
    private PORT:number;
    private ID:number = -1;
    private static connection:Connection;
    public handleMessage = (message: any) => {
        console.log(message)        
    };

    constructor(PORT: number, onConnection:Function|null) {
        this.PORT = PORT;
        this.client = new WebSocket(`ws://localhost:${PORT}`);
    
        this.client.onopen = () => {
            this.client.onmessage = this.handleMessage_;

            if(onConnection)
                onConnection();
        };

        if(!Connection.connection)
            Connection.connection = this;
    }




    public createCharacter(character:string, position:Vector3):void {
        this.client.send(JSON.stringify({
            action: 'CREATE',
            id: this.ID,
            character : character,
            position:position
        }));
    }

    public changeCharacter(new_character:string, new_position:Vector3):void {
        this.client.send(JSON.stringify({
            action: 'CHANGE',
            id: this.ID,
            character : new_character,
            position :new_position
        }));
    }
    
    public removeCharacter():void {
        this.client.send(JSON.stringify({
            action: 'REMOVE',
            id: this.ID
        }));
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

    

    public sendMessage(message:object):void {
        this.client.send(
            JSON.stringify({
                ...{id: this.ID},
                ...message
            })
        );
    }

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
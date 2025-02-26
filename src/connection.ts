//import WebSocket from 'ws';

import { Vector3 } from "three";

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
            this.client.send('Hello, World!');
            this.client.onmessage = this.handleMessage_;

            if(onConnection)
                onConnection();
        };

        if(!Connection.connection)
            Connection.connection = this;
    }




    public createCharacter(character:string, position:Vector3):void {
        this.client.send(`CREATE--${JSON.stringify({
            character : character,
            position :position
        })}`);
    }

    public changeCharacter(new_character:string, new_position:Vector3):void {
        this.client.send(`CHANGE--${JSON.stringify({
            character : new_character,
            position :new_position
        })}`);
    }
    
    public removeCharacter():void {
        this.client.send(`REMOVE--`);
    }



    private async handleMessage_ (/*this_: WebSocket, */ ev: MessageEvent<any>) {
        const message:string = await ev.data.text()

        switch (message.substring(0, 8)) {
            case "ID------":
                this.ID = Number(message.substring(8, message.length));
                console.log("ID", this.ID);
                break;
            case "CREATE--":
                console.log("criar boneco");
                const createCharacter:CreateCharacter = JSON.parse(message.substring(8, message.length));
                console.log(createCharacter);
                break;
            case "CHANGE--": console.log("mudar boneco"); break;
            case "REMOVE--": console.log("remover boneco"); break;
        }

        console.log(message)
    };
    

    public sendMessage(message:any):void {
        this.client.send(message);
    }

    public static getInstance():Connection {
        if(Connection.connection)
            return Connection.connection;

        console.warn("Conexão WebSocket iniciada na porta 4002 ...");
        return new Connection(4002, null);
    }
}


interface CreateCharacter {
    id:number,
    character:string,
    position:Vector3
}

interface ChangeCharacter {
    id:number,
    character:string,
    position:Vector3
}
interface RemoveCharacter {
    id:number,
}
interface MoveCharacter {
    id:number,
}
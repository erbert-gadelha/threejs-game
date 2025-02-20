//import WebSocket from 'ws';

export class Connection {
    private client:WebSocket;
    private static connection:Connection;

    constructor(PORT: number) {
        this.client = new WebSocket(`ws://localhost:${PORT}`);
    
        this.client.onopen = () => {
            this.client.send('Hello, World!');
            this.client.onmessage = this.handleMessage_;
        };

        if(!Connection.connection)
            Connection.connection = this;
    }
    


    public handleMessage = (message: any) => {
        console.log(message)        
    };

    private async handleMessage_ (/*this_: WebSocket, */ ev: MessageEvent<any>) {
        const message = await ev.data.text()
        console.log(message)
    };
    

    public sendMessage(message:any):void {
        this.client.send(message);
    }

    public static getInstance():Connection {
        if(Connection.connection)
            return Connection.connection;

        console.warn("Conexão WebSocket iniciada na porta 8080 ...");
        return new Connection(8080);
    }



    

}
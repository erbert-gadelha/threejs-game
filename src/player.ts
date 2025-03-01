import * as THREE from "three";
import ModelLoader from "./modelLoader";
import { Board } from "./board";
import { Render } from "./render";
import { Connection } from "./connection";
import Movement from "./movement";
import Navigation from "./navigation";


export default class Player {

    public static current:PlayerStatus = {
        name: 'missigno',
        object: new THREE.Object3D(),
        position: new THREE.Vector3(),
        standing: true,
        velocity: 10
    };


    
    public static async create(model:string, position:THREE.Vector3):Promise<PlayerStatus> {
        Player.current.object?.removeFromParent()
        console.log("create-position", position)
        Connection.getInstance().createCharacter(model, position.clone())
        

        const status = this.getStatus(model)
        let sprite;
        switch(status.model) {
            case 'obj': sprite = await ModelLoader.load(`character/${model}`); break;
            case 'gltf': sprite = await ModelLoader.LoadGLTF(model); break;
            default: sprite = new THREE.Object3D();
        }
    
        sprite.scale.multiplyScalar(.5)
        sprite.position.y = .5;
    
        const stamina_element = document.querySelector("#stamina-status");
        if (stamina_element && this.current) {
            if(this.current)
                stamina_element.classList.remove(this.current.name);   
            stamina_element.classList.add(model);   
        }
    
    
    
    
        const playerObject = new THREE.Group();
        if(!position)
            position = new THREE.Vector3(0,0,0)
        
        playerObject.add(sprite);
        playerObject.position.copy(position);
    
        playerObject.traverse((child:any) => {
            child.raycast = () => {}
    
        })
    
        playerObject.raycast = () => {}
        sprite.raycast = () => {}
    
        switch (model) {
            case 'charmander':
                const light:THREE.Light = new THREE.PointLight(0xffaa00, .5, 0, 2)
                light.position.copy(new THREE.Vector3(0,1.1,-.4));
                playerObject.add(light)
                break;
        }

        if(Board.board)
            Board.board.add(playerObject);

        setInterval(() => Render.render(), 100);
        this.current = {
            name: model,
            object: playerObject,
            position: playerObject.position,
            standing: status.standing,
            velocity: status.velocity
        };
        return this.current;
    }

    private static enemies:Map<number, PlayerStatus> = new Map();

    public static async newEnemy(id:number, model:string, position:THREE.Vector3|null|undefined, tile:number|null):Promise<PlayerStatus> {
        this.enemies.get(id)?.object.removeFromParent();
        const status = this.getStatus(model)

        if(!position) {
            if(tile)
                position = Navigation.navigation.nodes[tile].position
            else
                position = new THREE.Vector3(0,0,0)
        }

        let sprite;
        switch(status.model) {
            case 'obj': sprite = await ModelLoader.load(`character/${model}`); break;
            case 'gltf': sprite = await ModelLoader.LoadGLTF(model); break;
            default: sprite = new THREE.Object3D();
        }
    
        //sprite.scale.multiplyScalar(.5)
        sprite.position.y = 1;
            
    
        const enemyObject = new THREE.Group();        
        enemyObject.add(sprite);
        enemyObject.scale.multiplyScalar(.5)
        enemyObject.position.copy(position);
    
        enemyObject.traverse((child:any) => {
            child.raycast = () => {}    
        })
    
        enemyObject.raycast = () => {}
        sprite.raycast = () => {}
    
        switch (model) {
            case 'charmander':
                const light:THREE.Light = new THREE.PointLight(0xffaa00, .5, 0, 2)
                light.position.copy(new THREE.Vector3(0,1.1,-.4));
                enemyObject.add(light)
                break;
        }



        const enemy:PlayerStatus = {
            name: model,
            object: enemyObject,
            position: enemyObject.position,
            standing: status.standing,
            velocity: status.velocity
        };

        console.warn("enemy-object-position", enemyObject.position)

        if(Board.board)
            Board.board.add(enemyObject);
        setInterval(() => Render.render(), 100);

        this.enemies.set(id, enemy);
        return enemy;
    }


    public static removeEnemy(id:number) {
        const enemy = this.enemies.get(id)
        if(!enemy) {
            console.warn('objeto [Enemy] inexistente')
            return;
        }
        enemy.object.removeFromParent();
        this.enemies.delete(id);
    }


    public static async moveEnemy(id:number,  path:number[]) {
        const enemy = this.enemies.get(id)
        if(!enemy) return;

        Movement.moveFromPath(enemy, path);
    }

    public static getStatus(model:string):{standing:boolean,velocity:number,model:string} {
        const status = {
            "bulbasaur": {standing: false, velocity: 3, model: 'obj'},
            "squirtle":  {standing:  true, velocity: 3, model: 'obj'},
            "charmander":{standing:  true, velocity: 3, model: 'obj'},
            "pikachu":   {standing: false, velocity: 6, model: 'obj'},
            "nidoran":   {standing: false, velocity: 4, model: 'obj'},
            "dollynho":  {standing:  true, velocity: 4, model: 'gltf'},
        }[model]
    
        if(status == null)
            return {standing: true, velocity: 3, model:''}
        return status
    }
    

};

export interface PlayerStatus {
    name: string;
    object: THREE.Object3D,
    position: THREE.Vector3,
    standing: boolean,
    velocity: number
}


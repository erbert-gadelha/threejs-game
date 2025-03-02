import * as THREE from "three";
import ModelLoader from "./modelLoader";
import { Board } from "./board";
import { Render } from "./render";
import { Connection } from "./connection";
import Movement from "./movement";
import Navigation from "./navigation";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";


export default class Player {

    public static current:PlayerStatus = {
        name: 'missigno',
        object: new THREE.Object3D(),
        position: new THREE.Vector3(),
        standing: true,
        velocity: 10,
        label: null
    };


    
    public static async create(model:string, position:THREE.Vector3):Promise<PlayerStatus> {
        Player.current.object?.removeFromParent()
        Player.current.label?.removeFromParent();
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

        const label = Player.CreateLabel('me');
        playerObject.add(label);

        setInterval(() => Render.render(), 100);
        this.current = {
            name: model,
            object: playerObject,
            position: playerObject.position,
            standing: status.standing,
            velocity: status.velocity,
            label: label
        };

        return this.current;
    }

    private static enemies:Map<number, PlayerStatus> = new Map();

    public static async newEnemy(id:number, model:string, position:THREE.Vector3|null|undefined, tile:number|null):Promise<PlayerStatus> {
        const prevEnemy = this.enemies.get(id)
        if(prevEnemy) {
            if(prevEnemy.label) {
                console.log('label', prevEnemy.label)
                prevEnemy.object.remove(prevEnemy.label);
                prevEnemy.label.removeFromParent();
            }
            prevEnemy.object.removeFromParent();            
        }
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



        console.warn("enemy-object-position", enemyObject.position)
        const label = Player.CreateLabel(`player ${id}`);
        enemyObject.add(label);
        
        const enemy:PlayerStatus = {
            name: model,
            object: enemyObject,
            position: enemyObject.position,
            standing: status.standing,
            velocity: status.velocity,
            label: label
        };


        if(Board.board)
            Board.board.add(enemyObject);
        setInterval(() => Render.render(), 100);

        this.enemies.set(id, enemy);
        return enemy;
    }


    public static removeEnemy(id:number) {
        const enemy = this.enemies.get(id)        
        if(!enemy) {
            console.warn('objeto [Enemy] inexistente'); return;
        }

        if(enemy.label) {
            console.log('label', enemy.label)
            enemy.object.remove(enemy.label);
            enemy.label.removeFromParent();
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


    private static labelRenderer:CSS2DRenderer|undefined;
    private static CreateLabel(text:string):CSS2DObject {
        const nameDiv = document.createElement("div");
        nameDiv.className = "player-name";
        nameDiv.textContent = text;


        const nameLabel = new CSS2DObject(nameDiv);
        if(text === 'me')
            nameLabel.position.set(0, 1.5, 0);
        else
            nameLabel.position.set(0, 3, 0);
        

        if(!Player.labelRenderer) {
            const labelRenderer = new CSS2DRenderer();
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.domElement.style.position = "absolute";
            labelRenderer.domElement.style.top = "0px";
            labelRenderer.domElement.classList.add("player-names");
            document.body.appendChild(labelRenderer.domElement);

            const anim = () => {
                requestAnimationFrame(anim);        
                labelRenderer.render(Render.scene, Render.camera);
            }    
            anim();
        }

        return nameLabel;

    }
    

};

export interface PlayerStatus {
    name: string;
    object: THREE.Object3D,
    position: THREE.Vector3,
    standing: boolean,
    velocity: number,
    label: CSS2DObject|null
}


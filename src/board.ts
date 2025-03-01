import * as THREE from "three";
import { Render } from "./render";
import { Node } from "./graph";
import ModelLoader from "./modelLoader";


export class Board {
    private scene:THREE.Scene;
    private object:THREE.Object3D = new THREE.Object3D();
    private nodes:(Node|null)[][][] = [];
    public size:number = 0;
    private ONE_BLOCK_DOWN:THREE.Mesh = new THREE.Mesh();

    public static board:Board|null;


    public getNodes():(Node|null)[][][] {
        return this.nodes;
    }

    constructor(scene:THREE.Scene) {
        this.scene = scene;
        Board.board = this;
    }

    private render():void {
        Render.render();
    }
    
    public add(object:any) {
        this.object.add(object);
        this.render();
    }

    public async addBlock(object:any) {

        const cube = await ModelLoader.load(object.model)

        const {x,y,z} = object.position;

        cube.position.set(x,y,z);
        cube.scale.multiplyScalar(.5)
        
        cube.castShadow = true;
        cube.receiveShadow = true;

        this.ONE_BLOCK_DOWN.add(cube);

        const x_ = Math.floor(x+this.size/2);
        const z_ = Math.floor(z+this.size/2);

        this.nodes[y*2][z_][x_] = {
            id: `${x},${y},${z}`,
            object: cube,
            position: cube.position.clone()
        };
        
        this.render();
    }

    public removeBlock(object:any) {   

        const {x,y,z} = object.position;
        const x_ = Math.floor(x+this.size/2);
        const y_ = y*2;
        const z_ = Math.floor(z+this.size/2);

        if(this.nodes[y_][z_][x_]?.object != null)
            this.nodes[y_][z_][x_].object.removeFromParent() 

        this.nodes[y_][z_][x_] = null;
    
        this.render();
    }

    public async create(size:number):Promise<THREE.Object3D> {
        /*if(this.object){
            console.log(this.object)
            this.object.removeFromParent()
            this.scene.remove(this.object);
            this.scene.removeFromParent();
            this.object = new THREE.Object3D()
        }*/

        this.size = size;

        this.nodes = new Array(this.size);
        for(let i = 0; i < this.size; i++) {
            this.nodes[i] = new Array(this.size);
            for(let j = 0; j < this.size; j++)
                this.nodes[i][j] = new Array(this.size);
        }



        const y = 0;
        const half:number = Number.parseInt(`${size/2}`);

        this.ONE_BLOCK_DOWN.position.y = -.5
        this.object.add(this.ONE_BLOCK_DOWN);

        for(let x = 0; x < size; x++) {
            for(let z = 0; z < size; z++) {
                const mesh = await ModelLoader.load('scenary/grass_block');                
                mesh.scale.multiplyScalar(.5)
                mesh.position.set(x-half, 0, z-half);
                this.ONE_BLOCK_DOWN.add(mesh);

                this.nodes[y*2][z][x] = {
                    id: `${x},${y},${z}`,
                    object: mesh,
                    position: mesh.position.clone()
                };
            }
        }

        const directionalLight = new THREE.DirectionalLight(0xffddcc, 3); // Cor branca, intensidade 1
        directionalLight.position.set(5, 5, 5); // Define a posição da luz
        directionalLight.castShadow = true;


        //directionalLight.shadow.mapSize.width = 512; // default
        //directionalLight.shadow.mapSize.height = 512; // default
        //directionalLight.shadow.bias = -.0001;
        
        this.object.add(directionalLight);
        this.scene.add(this.object);
        this.object.rotation.x = 45 * (Math.PI/360);
        this.object.rotation.y = 30 * (Math.PI/360);
        return this.object;
    }
}

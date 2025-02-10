import * as THREE from "three";
import { Render } from "./render";


export class  Board {
    private scene:THREE.Scene;
    private object:THREE.Object3D = new THREE.Object3D();

    constructor(scene:THREE.Scene) {
        this.scene = scene;
    }


    private render():void {
        Render.render();
    }
    
    public add(object:THREE.Object3D) {
        this.object.add(object);
        this.render();
    }

    public addObject(object:any) {
        console.log(object)

        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshStandardMaterial({
                color: object?.color,
                emissive: 0xffffff,
                emissiveIntensity: 0
            })
        );

        cube.position.set(object.position.x, object.position.y, object.position.z);
        cube.material.color.setHex(object?.color);
        
        cube.castShadow = true;
        cube.receiveShadow = true;
        
        this.object.add(cube);
        this.render();
    }

    public create(size:number):THREE.Object3D {

        const colors:THREE.ColorRepresentation[] = [
            0xFF0000,
            0x00FF00,
            0x0000FF,
            0xFFFF00
        ]
        const half:number = Number.parseInt(`${size/2}`);
        for(let x = 0; x < size; x++) {
            for(let z = 0; z < size; z++) {
                const geometry = new THREE.BoxGeometry();
                const material = new THREE.MeshStandardMaterial({
                    color: colors[(x+z)%colors.length],
                    emissive: 0xffffff,
                    emissiveIntensity: 0
                });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(x-half, 0, z-half);


                cube.castShadow = true; //default is false
                cube.receiveShadow = true; //default

                this.object.add(cube);
            }
        }


        const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Cor branca, intensidade 1
        directionalLight.position.set(1, 2, 1); // Define a posição da luz
        directionalLight.castShadow = true; // default false


        directionalLight.shadow.mapSize.width = 512; // default
        directionalLight.shadow.mapSize.height = 512; // default
        directionalLight.shadow.camera.near = 0.5; // default
        directionalLight.shadow.camera.far = 500; // default
        
        this.object.add(directionalLight);
        this.scene.add(this.object);
        this.object.rotation.x = 45 * (Math.PI/360);
        this.object.rotation.y = 30 * (Math.PI/360);
        return this.object;
    }
}

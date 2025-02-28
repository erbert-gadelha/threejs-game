import * as THREE from "three";
import { DRACOLoader, OBJLoader } from 'three-stdlib';
import { MTLLoader } from 'three-stdlib';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Board } from "./board";




export default class ModelLoader {
    private static mtlLoader:any = new MTLLoader();
    private static objLoader:any = new OBJLoader();
    private static fbxLoader = new FBXLoader();
    private static gltfLoader = new GLTFLoader();
    private static textureLoader = new THREE.TextureLoader();
    private static models: { [key: string]: THREE.Mesh } = {}

    public static async loadTexture(model: string):Promise<THREE.Texture> {
        const url = `/threejs-game/obj/character/${model}/emissive.png`
        const texture:THREE.Texture = await this.textureLoader.load(url)
        console.log("loadTexture", url,  texture)
        return texture;
    }

    public static async load(model: string): Promise<THREE.Object3D> {
        const objPath = `/threejs-game/obj/${model}/model.obj`;
        const mtlPath = `/threejs-game/obj/${model}/model.mtl`;
        const txtPath = `/threejs-game/obj/${model}/emissive.png`

        const cached = ModelLoader.models[model];
        if (cached) {
            const clone = new THREE.Mesh(cached.geometry, cached.material);
            clone.castShadow = true;
            clone.receiveShadow = true;
            return new Promise((resolve) => { resolve(clone); });
        }
        
        const texture = await this.textureLoader.load(txtPath)
    
        return new Promise((resolve, reject) => {
            ModelLoader.mtlLoader.load(
                mtlPath,
                (materials:any) => {
                    materials.preload();
                    ModelLoader.objLoader.setMaterials(materials);
                    ModelLoader.objLoader.load(objPath, (object:THREE.Mesh) => { 
                        object.traverse((child:any) => {
                            if (child.isMesh) {
                                if (!(object.material instanceof THREE.MeshStandardMaterial))
                                    child.material = new THREE.MeshStandardMaterial({color: child.material.color, map: child.material.map});
                                
                                child.castShadow = true;
                                child.receiveShadow = true;
                                child.material.emissiveMap = texture
                                child.material.emissive = new THREE.Color(1, 1, 1);
                                child.material.needsUpdate = true;

                            if(!ModelLoader.models[model])
                                ModelLoader.models[model] = child.clone(true)
                            }
                        });

                        resolve(ModelLoader.models[model]);}, null, (error:any) => { reject(error);});
                }, null, (error:any) => { reject(`Erro ao carregar o material: ${error}`); }
            );
        });
    }
    

    
    public static async LoadGLTF(model:string):Promise<THREE.Object3D> {

        const cached = ModelLoader.models[model];
        if (cached) {
            const clone = new THREE.Mesh(cached.geometry, cached.material);
            clone.castShadow = true;
            clone.receiveShadow = true;
            return new Promise((resolve) => { resolve(clone); });
        }

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("/draco/");      
        this.gltfLoader.setPath(`obj/character/${model}/`);
        this.gltfLoader.setResourcePath(`obj/character/${model}/`);
        this.gltfLoader.setDRACOLoader(dracoLoader);


        return new Promise((resolve, reject) => {

            this.gltfLoader.load("source/model.gltf", (object:any) => {
                object.scene.scale.set(0.035, 0.035, 0.035);
                object.scene.position.set(0,1.5,0);
                object.scene.traverse((child:any) => {
                    if (child.isMesh) {
                        if (!(object.material instanceof THREE.MeshStandardMaterial))
                            child.material = new THREE.MeshStandardMaterial({color: child.material.color, map: child.material.map});
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                //const mixer = new THREE.AnimationMixer(object);
                //console.log("Animações disponíveis:", object.animations.map((a:any) => a?.name));
                //const action = mixer.clipAction(object.animations[1]); 
                resolve(object.scene);
            }, null, (err:any)=>{
                console.log(err);
                reject(null)
            });


        });
    }

}
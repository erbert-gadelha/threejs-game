import * as THREE from "three";
import { OBJLoader } from 'three-stdlib';
import { MTLLoader } from 'three-stdlib';



export default class ModelLoader {
    private static mtlLoader:any = new MTLLoader();
    private static objLoader:any = new OBJLoader();
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
    

}
import * as THREE from "three";
import { OBJLoader } from 'three-stdlib';
import { MTLLoader } from 'three-stdlib';



export default class ModelLoader {
    private static mtlLoader:any = new MTLLoader();
    private static objLoader:any = new OBJLoader();
    private static models: { [key: string]: THREE.Mesh } = {}

    public static async load(model: string): Promise<THREE.Object3D> {
        const objPath = `/threejs-game/obj/${model}/model.obj`;
        const mtlPath = `/threejs-game/obj/${model}/model.mtl`;

        const cached = ModelLoader.models[model];
        if (cached) {
            const clone = new THREE.Mesh(cached.geometry, cached.material);
            clone.castShadow = true;
            clone.receiveShadow = true;
            return new Promise((resolve) => { resolve(clone); });
        }
        
    
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
import * as THREE from "three";


export interface Player {
    name: string;
    object: THREE.Object3D,
    position: THREE.Vector3,
    standing: boolean,
    velocity: number
}


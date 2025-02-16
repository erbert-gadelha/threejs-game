import * as THREE from "three";


export interface Player {
    object: THREE.Object3D,
    position: THREE.Vector3,
    standing: boolean,
    velocity: number
}


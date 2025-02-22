import * as THREE from "three";


export interface Edge {
    n1:Node,
    n2:Node,
    distance:number,
}

export interface Node {
    id: string|null
    object: THREE.Object3D|null
    position: THREE.Vector3
}


export interface Dijkstra {
    node:Node,
    parent:Dijkstra|null,
    distance:number,
    isVisited:boolean
}
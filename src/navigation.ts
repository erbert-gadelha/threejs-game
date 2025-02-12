import * as THREE from "three";

export default class Navigation {
    private board:THREE.Object3D[][]|null = null;
    private navigation:Navigation|null = null;

    constructor(board:THREE.Object3D[][]|null) {
        if(board)
            this.board = board;

        if(this.navigation)
            this.navigation = this;
    }

    public set(board:THREE.Object3D[][]):void {
        const navigation:Navigation = new Navigation(null);
        window.alert("Deve criar um grafo de caminhos possíveis!");
    }

    public getInstance():Navigation {
        if(this.navigation)
            return this.navigation;        
        this.navigation = new Navigation(null);
        return this.navigation;
    }


    public findPath(origin:THREE.Object3D, target:THREE.Object3D):THREE.Object3D[] {
        const path:THREE.Object3D[] = [];
        window.alert("Deve aplicar Diskstra ao grafo existente!");
        console.log(this.board);
        return path;
    }

}


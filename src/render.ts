import * as THREE from "three";

export class Render {
    public static renderer:THREE.WebGLRenderer;
    public static scene:THREE.Scene;
    public static camera:THREE.Camera;

    constructor() {
        console.log("cons")
    }

    public static set(renderer:THREE.WebGLRenderer, scene:THREE.Scene, camera:THREE.Camera) : void {
        this.renderer = renderer;
        this.scene = scene;
        this.camera= camera;

        console.log("setou")
    }

    public static render() : void {
        this.renderer.render(this.scene, this.camera);
    }
}
import * as THREE from "three";
import { mx_bilerp_0 } from "three/src/nodes/materialx/lib/mx_noise.js";

export class Render {
    public static renderer:THREE.WebGLRenderer;
    public static scene:THREE.Scene;
    public static camera:THREE.Camera;

    public static set(renderer:THREE.WebGLRenderer, scene:THREE.Scene, camera:THREE.Camera) : void {
        this.renderer = renderer;
        this.scene = scene;
        this.camera= camera;

        window.addEventListener("resize", () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            if(camera instanceof THREE.PerspectiveCamera) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
            renderer.setSize(width, height);
            this.render();
        });
        
    }

    public static render() : void {
        this.renderer.render(this.scene, this.camera);

    }
}
import * as THREE from "three";
import Stats from 'stats.js'


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

        this.stats = new Stats()
        this.stats.showPanel(0)
        document.body.appendChild(this.stats.dom)
        const animate = () => {
            requestAnimationFrame(animate);
            this.stats.update(); // Atualiza o FPS no painel
            renderer.render(scene, camera);
        }
        animate();
    }

    static stats:Stats;

    public static render() : void {
        this.renderer.render(this.scene, this.camera);

    }
}
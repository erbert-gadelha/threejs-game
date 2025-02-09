import * as THREE from "three";
import { Render } from "./render";


export class Control {
    private scene:THREE.Scene;
    private camera:THREE.PerspectiveCamera;
    private raycaster:THREE.Raycaster  = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private isMouseDown = false;
    private isDragging:boolean = false;
    private lastX = 0;
    private lastY = 0;
    private board:THREE.Object3D;
    public selector:THREE.Object3D;
    public selected:THREE.Object3D|null = null;


    public method:Function = (param:any) => {console.log(param)};

    constructor(scene:THREE.Scene, camera:THREE.PerspectiveCamera, board:THREE.Object3D) {
        this.scene = scene;
        this.camera = camera;
        this.board = board;


        const material:THREE.MeshBasicMaterial =  new THREE.MeshBasicMaterial({   
                color: 0xffffff,
                transparent: true, 
                opacity: 0.5 // Define a transparência (0 = invisível, 1 = opaco)
            });
        const geometry = new THREE.PlaneGeometry(1.03, 1.03);
        
        this.selector = new THREE.Mesh(geometry, material);
        this.selector.rotation.x = -Math.PI / 2;
        this.selector.position.set(0,0.5001,0);
        //this.selector.layers.set(1);
        this.selector.raycast = () => {};

    }


    // Função para detectar clique
    public onMouseClick(event: MouseEvent) {
        if(this.isDragging)
            return;

        const object:THREE.Object3D|null = this.rayCast(event);
        if (object != null)
            this.method(object);        
    }

    private rayCast (event: MouseEvent):THREE.Object3D|null {
        // Normalizando as coordenadas do clique (valores entre -1 e 1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Atualiza o Raycaster
        this.raycaster.layers.set(0);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        if(intersects.length > 0)
            return intersects[0].object;
        return null;
    }


    public onMouseDown(event:MouseEvent) {
        this.isMouseDown = true;
        this.lastX = event.clientX;
        this.lastY = event.clientY;
        this.isDragging = false;
    }
    public onMouseUp(/*event:MouseEvent*/) {
        this.isMouseDown = false;
    }

    public onMouseMove(event:MouseEvent) {
        if (this.isMouseDown) {
            this.isDragging = true;
            const deltaX = this.lastX-event.clientX;
            const deltaY = this.lastY-event.clientY;
            this.board.rotation.y -= deltaX * 0.005;
            this.board.rotation.x -= deltaY * 0.005;
            this.lastX = event.clientX;
            this.lastY = event.clientY;
            this.render();
        } else {
            const object:THREE.Object3D|null = this.rayCast(event);

            if(object == this.selected)
                return;
            
            
            if(object != null) {
                this.selector.position.set(
                    object.position.x,
                    object.position.y + 0.5001,
                    object.position.z);
                this.selector.visible = true;
            } else
                this.selector.visible = false;

            this.selected = object;
            this.render();
        }

    }

    public onMouseWheel(event:WheelEvent) {
        const newPosition:number = this.camera.position.z + (event.deltaY / 60);
        this.camera.position.z = this.clamp(2, newPosition, 20);
        this.render();
    }

    private render():void {
        Render.render();
    }

    private clamp (min:number, value:number, max:number):number  {
        return Math.min(Math.max(value, min), max);
    }


}

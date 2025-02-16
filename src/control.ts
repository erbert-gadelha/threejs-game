import * as THREE from "three";
import { Render } from "./render";


export class Control {
    private scene:THREE.Scene;
    private camera:THREE.PerspectiveCamera;
    private raycaster:THREE.Raycaster  = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private input:{[key:string]:boolean} = {"mouse_0": false, "mouse_1": false, "mouse_2": false};
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
                opacity: 0.5
            });
        const geometry = new THREE.PlaneGeometry(1.03, 1.03);
        
        this.selector = new THREE.Mesh(geometry, material);
        this.selector.rotation.x = -Math.PI / 2;
        this.selector.position.set(0,0.5001,0);
        this.selector.raycast = () => {};
        this.selector.visible = false;


        window.addEventListener("click",    (event) => this.onMouseClick(event));
        window.addEventListener("mouseup",  (event) => this.onMouseUp(event));
        window.addEventListener("mousedown",(event) => this.onMouseDown(event));
        window.addEventListener("mousemove",(event) => this.onMouseMove(event));
        window.addEventListener("touchstart",  (event) => this.onTouchStart(event));
        window.addEventListener("touchmove",  (event) => this.onTouchMove(event));
        window.addEventListener("wheel",    (event) => this.onMouseWheel(event));

    }

    public setBoardObject(object:THREE.Object3D):void {
        this.board = object;
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
        switch(event.button) {
            case 0: this.input['mouse_0'] = true; break; // left
            case 1: this.input['mouse_1'] = true; break; // middle
            case 2: this.input['mouse_2'] = true; break; // right
        }
        this.lastX = event.clientX;
        this.lastY = event.clientY;
        this.isDragging = false;
    }
    public onMouseUp(event:MouseEvent) {
        switch(event.button) {
            case 0: this.input['mouse_0'] = false; break; // left
            case 1: this.input['mouse_1'] = false; break; // middle
            case 2: this.input['mouse_2'] = false; break; // right
        }
    }

    public onMouseMove(event:MouseEvent) {

        if (this.input['mouse_0']) {
            this.isDragging = true;
            const deltaX = this.lastX-event.clientX;
            const deltaY = this.lastY-event.clientY;
            this.board.rotation.y -= deltaX * 0.005;
            this.board.rotation.x -= deltaY * 0.005;
            this.lastX = event.clientX;
            this.lastY = event.clientY;
            this.render();
        } else if(this.input['mouse_1']) {

            const deltaX = this.lastX-event.clientX;
            const deltaY = this.lastY-event.clientY;
            this.lastX = event.clientX;
            this.lastY = event.clientY;

            this.camera.position.x+= deltaX/100;
            this.camera.position.y-= deltaY/100;

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


    private touchDistance:number = 0;

    public onTouchStart(event: TouchEvent) {
        if(event.touches.length == 2) {
            const x_t0 = event.touches[0].clientX;
            const y_t0 = event.touches[0].clientY;
            const x_t1 = event.touches[1].clientX;
            const y_t1 = event.touches[1].clientY;
            
            const deltaX = x_t0 - x_t1;
            const deltaY = y_t0 - y_t1;

            this.touchDistance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
            return;
        }
        const touch = event.touches[0];
        this.lastX = touch.clientX;
        this.lastY = touch.clientY;
        event.preventDefault()
    }
    
    public onTouchMove(event: TouchEvent) {

        event.preventDefault()

        if(event.touches.length == 1) {
            const touch = event.touches[0];
            const deltaX = (this.lastX - touch.clientX) * 0.005;
            const deltaY = (this.lastY - touch.clientY) * 0.005;

            console.log("", deltaX, deltaY);
        
            this.board.rotation.y -= deltaX;
            this.board.rotation.x -= deltaY;
        
            this.lastX = touch.clientX;
            this.lastY = touch.clientY;
            
        } else if (event.touches.length == 2) {
            const x_t0 = event.touches[0].clientX;
            const y_t0 = event.touches[0].clientY;
            const x_t1 = event.touches[1].clientX;
            const y_t1 = event.touches[1].clientY;
            
            const deltaX = x_t0 - x_t1;
            const deltaY = y_t0 - y_t1;

            const touchDistance_ = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
            //this.camera.position.z += (touchDistance_ - this.touchDistance)/10
            const newPosition:number = this.camera.position.z - (touchDistance_ - this.touchDistance)/10;
            this.camera.position.z = this.clamp(2, newPosition, 20);
            this.touchDistance = touchDistance_;
        }

        this.render();
        
    }


}

import * as THREE from "three";
import { Board } from "./board";
import { Control } from "./control";
import { Render } from "./render";
import Navigation from "./navigation";
import ModelLoader from "./modelLoader";


// Criar a cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b77f3); // Azul claro (cor do céu)


// Cria Luz Ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Cor branca, intensidade 0.5
scene.add(ambientLight);

// Criar a câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

// Criar o renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

Render.set(renderer, scene, camera);


const board:Board = new Board(scene);
const boardObject:THREE.Object3D = await board.create(5);



Render.render();




// Ajustar a tela quando a janela for redimensionada
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});


board.addBlock({model:'grass_block', position: { x: 1, y: 1, z: 1 }})
board.addBlock({model:'grass_block', position: { x: 0, y: 1, z: 1 }})
board.addBlock({model:'grass_block', position: { x: 0, y: 1, z: 0 }})
board.addBlock({model:'grass_block', position: { x: 0, y: 1, z: -1 }})
board.addBlock({model:'grass_block', position: { x: -1,y:.5, z: -1}})
board.removeBlock({position: { x: -1, y: 0, z: -1 }});
board.removeBlock({position: { x: 1, y: 0, z: 1 }});
board.removeBlock({position: { x: 0, y: 0, z: -2 }});
board.removeBlock({position: { x: 0, y: 0, z: -1 }});
board.removeBlock({position: { x: 0, y: 0, z:  0 }});
board.removeBlock({position: { x: 0, y: 0, z:  1 }});
board.removeBlock({position: { x: 0, y: 0, z:  2 }});



const control:Control = new Control(scene, camera, boardObject);
board.add(control.selector);
window.addEventListener("click",    (event) => control.onMouseClick(event));
window.addEventListener("mouseup",  (event) => control.onMouseUp(event));
window.addEventListener("mousedown",(event) => control.onMouseDown(event));
window.addEventListener("mousemove",(event) => control.onMouseMove(event));
window.addEventListener("touchstart",  (event) => control.onTouchStart(event));
window.addEventListener("touchmove",  (event) => control.onTouchMove(event));
window.addEventListener("wheel",    (event) => control.onMouseWheel(event));




async function createPlayer(model:string) {
    const sprite = await ModelLoader.load(model);
    sprite.scale.multiplyScalar(.5)
    sprite.position.y = .5;

    const player_ = new THREE.Group();
    
    player_.add(sprite);
    player_.position.set(0,1,0)
    player_.raycast = () => {}
    sprite.raycast = () => {}

    return player_;
}

// Criar geometria e material
const player = await createPlayer('bulbasaur');
board.add(player);




let running_anim:Promise<void>|null = null;


const navigation:Navigation = new Navigation(board);

control.method = async (object:THREE.Object3D) => {
    if(running_anim != null)
        return;

    console.log("position", object.position)

    const path = navigation.findPath(player.position.clone(), object.position.clone());
    running_anim =  moveTo(player, path);
};



async function moveTo(object: THREE.Object3D, path: THREE.Vector3[]): Promise<void> {
    if (path.length < 2) {
        running_anim = null;
        setTimeout(() => running_anim = null, 20);
        return;
    }

    const velocity = 3;
    const maxHeight = 1.5;  // Altura máxima do pulo
    let vel_y, vel_x, rotation;
    let i = 0;

    let from = path[i];
    let to = path[i + 1];
    let delta = new THREE.Vector3(to.x-from.x,0,to.z-from.z).normalize().multiplyScalar(velocity / 60);
    const position = object.position.clone();

    const moveTo_anim = () => {
        if (i > path.length) {
            object.position.set(to.x, to.y, to.z);
            object.children[0].rotation.x = 0;
            running_anim = null;
            setTimeout(() => running_anim = null, 20);
            Render.render();
            return;
        }

        const v2a = new THREE.Vector2(object.position.x, object.position.z), v2b = new THREE.Vector2(to.x, to.z);
        const distance = v2a.distanceTo(v2b);
        object.rotation.y = Math.atan2(delta.x, delta.z);
        if (distance <= 0.05) {
            position.set(to.x, to.y, to.z);
            object.position.copy(position);

            if (++i < path.length - 1) {
                from = path[i];
                to = path[i + 1];
                delta = new THREE.Vector3(to.x-from.x,0,to.z-from.z).normalize().multiplyScalar(velocity / 60);
                object.rotation.y = Math.atan2(delta.x, delta.z);
            }
        } else {
            if (from.y == to.y) {
                vel_y = .1; vel_x = 1; rotation = 20;
            } else {
                vel_y = .4; vel_x = 0.7; rotation = 50;
            }

            position.add(delta.clone().multiplyScalar(vel_x));
            object.position.copy(position);
            
            const middle = 1-Math.abs(distance-0.5)*2
            object.position.y = from.y*distance + middle*vel_y + to.y*(1-distance);
            object.children[0].rotation.x = (.5-distance)*rotation*(Math.PI/180);
            Render.render();
        }
        
        requestAnimationFrame(() => moveTo_anim());
    }
    moveTo_anim();
}






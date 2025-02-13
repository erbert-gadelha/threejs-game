import * as THREE from "three";
import { Board } from "./board";
import { Control } from "./control";
import { Render } from "./render";
import Navigation from "./navigation";

// Criar a cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b77f3); // Azul claro (cor do céu)


// Cria Luz Ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 0.05); // Cor branca, intensidade 0.5
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
const boardObject:THREE.Object3D = board.create(5);



Render.render();




// Ajustar a tela quando a janela for redimensionada
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});


board.addBlock({
    color:0xffff00,
    position: { x: 1, y: 1, z: 1 }
})

board.addBlock({
    color:0x0000ff,
    position: { x: 0, y: 2, z: 1 }
})

board.addBlock({
    color:0x00ff00,
    position: { x: 0, y: 2, z: 0 }
})
board.addBlock({
    color:0xff0000,
    position: { x: 0, y: 2, z: -1 }
})

board.addBlock({
    color:0x0000ff,
    position: { x: -1, y: 1, z: -1 }
})

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
window.addEventListener("mouseup",  (/*event*/) => control.onMouseUp(/*event*/));
window.addEventListener("mousedown",(event) => control.onMouseDown(event));
window.addEventListener("mousemove",(event) => control.onMouseMove(event));
window.addEventListener("wheel",    (event) => control.onMouseWheel(event));




function createPlayer() {
    const geometry = new THREE.BoxGeometry(.5, .5, .5);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const sprite = new THREE.Mesh(geometry, material);
    sprite.castShadow = true;
    sprite.receiveShadow = true;
    sprite.position.y = 1 - (0.5/2);

    const player_ = new THREE.Group();
    
    player_.add(sprite);
    player_.position.set(0,2,0)
    player_.raycast = () => {}
    sprite.raycast = () => {}

    return player_;
}

// Criar geometria e material
const player = createPlayer();
board.add(player);




let running_anim:Promise<void>|null = null;


const navigation:Navigation = new Navigation(board);

control.method = async (object:THREE.Object3D) => {
    if(running_anim != null)
        return;

    const path = navigation.findPath(player.position.clone(), object.position.clone());
    running_anim =  moveTo(player, path);
};


async function moveTo (object:THREE.Object3D, path:THREE.Vector3[]):Promise<void> {
    if(path.length < 2) {
        running_anim = null;
        setTimeout(()=>running_anim=null, 20);
        return;
    }

    const velocity = 3;
    let i = 0;

    let from = path[i];
    let to = path[i+1];

    let delta = to.clone().sub(from).normalize().multiplyScalar(velocity/60);

    const moveTo_anim = () => {
        if(i > path.length) {
            object.position.set(to.x, to.y, to.z);
            running_anim = null;
            setTimeout(()=>running_anim=null, 20);
            Render.render();
            return;
        }        

        const distance = object.position.distanceTo(to);
        if(distance <= 0.1) {
            object.position.set(to.x, to.y, to.z);
            if(++i < path.length-1) {
                from = path[i];
                to = path[i+1];
                
                delta = to.clone().sub(from).normalize().multiplyScalar(velocity/60);
            }
        } else {
            object.position.add(delta);
            Render.render();
        }        
        requestAnimationFrame(() => moveTo_anim());        
    }
    moveTo_anim();
}






Render.render()
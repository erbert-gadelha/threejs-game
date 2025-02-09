import * as THREE from "three";
import { Board } from "./board";
import { Control } from "./control";
import { Render } from "./render";

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


/*function render() {
    renderer.render(scene, camera);
}*/

// Animação
/*function animate(mesh:THREE.Object3D) {
    requestAnimationFrame(() => animate(mesh));
    //mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    Render.render();
}
animate(boardObject);*/
//render();
Render.render();




// Ajustar a tela quando a janela for redimensionada
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});



board.addObject({
    color:0x00ff00,
    position: { x: 0, y: 2, z: 0 }
})

const control:Control = new Control(scene, camera, boardObject);
board.add(control.selector);
window.addEventListener("click",    (event) => control.onMouseClick(event));
window.addEventListener("mouseup",  (/*event*/) => control.onMouseUp(/*event*/));
window.addEventListener("mousedown",(event) => control.onMouseDown(event));
window.addEventListener("mousemove",(event) => control.onMouseMove(event));
window.addEventListener("wheel",    (event) => control.onMouseWheel(event));

/*control.method = (object:THREE.Object3D) => {
    const mesh = object as THREE.Mesh;
    let count = 15;
    const steps = 10;

    const anim = (fade:number) => {
        if(fade > 0) {
            count++;
            object.material.emissiveIntensity = count/steps;
            if(count < steps)
                requestAnimationFrame(()=>anim(1));
            else
                requestAnimationFrame(()=>anim(-1));
        } else {
            count--;
            object.material.emissiveIntensity = count/steps;
            if(count > 0)
                requestAnimationFrame(()=>anim(-1));
        }
        Render.render();
    }
    anim(1);
};*/





function CriarPokemon() {
    const geometry = new THREE.BoxGeometry(.5, .5, .5);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const sprite = new THREE.Mesh(geometry, material);
    sprite.castShadow = true;
    sprite.receiveShadow = true;
    sprite.position.y = 1 - (0.5/2);
    const pokemon = new THREE.Group();
    pokemon.add(sprite);

    pokemon.raycast = () => {}
    sprite.raycast = () => {}

    return pokemon;
}

// Criar geometria e material
const pokemon = CriarPokemon();
board.add(pokemon);


control.method = (object:THREE.Object3D) => {    
    pokemon.position.set(
        object.position.x,
        object.position.y,
        object.position.z
    );    
    Render.render();
};
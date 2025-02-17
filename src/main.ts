import * as THREE from "three";
import { Board } from "./board";
import { Control } from "./control";
import { Render } from "./render";
import Navigation from "./navigation";
import ModelLoader from "./modelLoader";
import Movement from "./movement";
import { Player } from "./player";


// Criar a cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b77f3); // Azul claro (cor do céu)


// Cria Luz Ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, .5); // Cor branca, intensidade 0.5
scene.add(ambientLight);

// Criar a câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

// Criar o renderizador
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

Render.set(renderer, scene, camera);
const board:Board = new Board(scene);
let player:Player|null;



const control:Control = new Control(scene, camera, new THREE.Mesh());
board.add(control.selector);


async function createPlayer(model:string, position:THREE.Vector3|null):Promise<Player> {
    const sprite = await ModelLoader.load(`character/${model}`);
    sprite.scale.multiplyScalar(.5)
    sprite.position.y = .5;

    const stamina_element = document.querySelector("#stamina-status");
    if (stamina_element && player) {
        if(player)
            stamina_element.classList.remove(player.name);   
        stamina_element.classList.add(model);   
    }



    const status = getStatus(model)

    const player_ = new THREE.Group();
    if(!position)
        position = new THREE.Vector3(0,0,0)
    
    player_.add(sprite);
    player_.position.copy(position);

    player_.raycast = () => {}
    sprite.raycast = () => {}

    switch (model) {
        case 'charmander':
            const light:THREE.Light = new THREE.PointLight(0xffaa00, .5, 0, 2)
            light.position.copy(new THREE.Vector3(0,1.1,-.4));
            player_.add(light)
            break;
    }


    return {
        name: model,
        object: player_,
        position: player_.position,
        standing: status.standing,
        velocity: status.velocity
    };
}





let running_anim:Promise<void>|null = null;
const navigation:Navigation = new Navigation(null);

let stamina_count = 0;

control.method = async (object:THREE.Object3D) => {
    if(running_anim != null)
        return; const player:Player = getPlayer();

    const path = navigation.findPath(player.position, object.position.clone());
    const onEndAnim = () => { running_anim = null; player.position=player.object.position; };
    stamina_count = 0

    running_anim = Movement.moveTo(player, path, onEachStep, onEndAnim)//, onEachStep)
};
const onEachStep = (stamina:number) => {
    stamina_count += Math.round(stamina * 2) / 2;
    const element:HTMLElement|null = document.querySelector("#hud-stamina")
    if(element)
        element.innerText = stamina_count.toFixed(1);
}

function getPlayer():Player {
    if (player)
        return player;
    return {name: "null", object: new THREE.Mesh(), position: new THREE.Vector3(), standing: true, velocity: 10}
}



async function createMap():Promise<THREE.Object3D> {
    const boardObject:THREE.Object3D = await board.create(5);
    board.addBlock({model:'scenary/grass_block', position: { x: 1, y: 1, z: 1 }})
    board.addBlock({model:'scenary/grass_block', position: { x: 0, y: 1, z: 1 }})
    board.addBlock({model:'scenary/grass_block', position: { x: 0, y: 1, z: 0 }})
    board.addBlock({model:'scenary/grass_block', position: { x: 0, y: 1, z: -1 }})
    board.addBlock({model:'scenary/grass_block', position: { x: -1,y:.5, z: -1}})
    board.removeBlock({position: { x: -1, y: 0, z: -1 }});
    board.removeBlock({position: { x: 1, y: 0, z: 1 }});
    board.removeBlock({position: { x: 0, y: 0, z: -2 }});
    board.removeBlock({position: { x: 0, y: 0, z: -1 }});
    board.removeBlock({position: { x: 0, y: 0, z:  0 }});
    board.removeBlock({position: { x: 0, y: 0, z:  1 }});
    board.removeBlock({position: { x: 0, y: 0, z:  2 }});
    return boardObject;
}

start("bulbasaur");
async function start(pokemon:"bulbasaur"|"squirtle"|"charmander"|"pikachu"|"nidoran") {
    const boardObject:THREE.Object3D = await createMap();
    control.setBoardObject(boardObject);
    player = await createPlayer(pokemon,  new THREE.Vector3(0,1,0));    
    board.add(player.object);
    navigation.set(board)
}


async function reset(model:string) {
    getPlayer().object?.removeFromParent()
    running_anim = null;
    player = await createPlayer(model,  new THREE.Vector3(0,1,0));
    board.add(player.object);
    setInterval(() => Render.render(), 100);
}







const hud:HTMLDivElement|null = document.querySelector("#hud");
["click", "mousedown"].forEach((event_name:string) => {
    hud?.addEventListener(event_name, (e:any) => {
        e.stopPropagation();
    })
});


console.log(hud?.querySelector("select"))
hud?.querySelector("select")?.addEventListener("change", (e:any) => {
    reset(e.target.value)
})


function getStatus(model:string) {
    const status = {
        "bulbasaur": {standing: false, velocity: 3},
        "squirtle": {standing: true, velocity: 3},
        "charmander": {standing: true, velocity: 3},
        "pikachu": {standing: false, velocity: 6},
        "nidoran": {standing: false, velocity: 4},
    }[model]

    if(status == null)
        return {standing: true, velocity: 3}
    return status
}

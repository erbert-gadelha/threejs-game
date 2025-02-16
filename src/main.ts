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
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

Render.set(renderer, scene, camera);
const board:Board = new Board(scene);
let player:Player|null;



const control:Control = new Control(scene, camera, new THREE.Mesh());
board.add(control.selector);


async function createPlayer(model:string, position:THREE.Vector3|null, standing:boolean, velocity:number):Promise<Player> {
    const sprite = await ModelLoader.load(`character/${model}`);
    sprite.scale.multiplyScalar(.5)
    sprite.position.y = .5;

    const player_ = new THREE.Group();
    if(!position)
        position = new THREE.Vector3(0,0,0)
    
    player_.add(sprite);
    player_.position.copy(position);

    player_.raycast = () => {}
    sprite.raycast = () => {}

    return {
        object: player_,
        position: player_.position,
        standing: standing,
        velocity: velocity
    };
}





let running_anim:Promise<void>|null = null;
const navigation:Navigation = new Navigation(null);

control.method = async (object:THREE.Object3D) => {
    if(running_anim != null)
        return;
    const player:Player = getPlayer();
    const path = navigation.findPath(player.position, object.position.clone());
    //running_anim = Movement.moveTo(player.object, path, player.standing, () => { running_anim = null; player.position=player.object.position; })
    running_anim = Movement.moveTo(player, path, () => { running_anim = null; player.position=player.object.position; })

};

function getPlayer():Player {
    if (player)
        return player;
    return {object: new THREE.Mesh(), position: new THREE.Vector3(), standing: true, velocity: 10}
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

start();
async function start() {
    const boardObject:THREE.Object3D = await createMap();
    control.setBoardObject(boardObject);

    //player = await createPlayer('squirtle', new THREE.Vector3(0,1,0), true, 3);
    //player = await createPlayer('charmander', new THREE.Vector3(0,1,0), true, 3);
    //player = await createPlayer('nidoran', new THREE.Vector3(0,1,0), false, 3);
    player = await createPlayer('pikachu', new THREE.Vector3(0,1,0), false, 6);
    //player = await createPlayer('bulbasaur', new THREE.Vector3(0,1,0), false, 3);
    board.add(player.object);
    navigation.set(board)
}



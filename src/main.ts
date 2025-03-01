import * as THREE from "three";
import { Board } from "./board";
import { Control } from "./control";
import { Render } from "./render";
import Navigation from "./navigation";
import Movement from "./movement";
import Player from "./player";
import { Dijkstra } from "./graph";
import { Connection } from "./connection";




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
//let playerStatus:PlayerStatus|null;



const control:Control = new Control(scene, camera, new THREE.Mesh());
board.add(control.selector);








let running_anim:Promise<void>|null = null;
const navigation:Navigation = new Navigation(null);


let dijkstra:Dijkstra[] = []

control.onClick = async (object:THREE.Object3D) => {
    if(running_anim != null)
        return;
    
    const to = object.position.clone();
    running_anim = Movement.moveTo(Player.current, to, dijkstra, onEachStep, onEndAnim)//, onEachStep)
};


control.onMove = async (object:THREE.Object3D|null) => {
    if(object == null || running_anim != null)
        return;
    //drawLines(Navigation.getPath(object.position.clone(), dijkstra))  
    drawLines(Navigation.getPath_indexes(object.position.clone(), dijkstra))    
};



let lines:THREE.Line|null = null;


function drawLines(indexes:number[]):void {
    const positions:THREE.Vector3[] = dijkstra.map(d => d.node.position);
    const points:THREE.Vector3[] = []

    for (let i = 0; i < indexes.length; i++) {
        const curr = positions[indexes[i]];
        if(i > 0) {
            const prev = positions[indexes[i-1]];
            const middle1 = curr.clone().add(prev).multiplyScalar(.5)
            middle1.y = curr.y
            points.push(middle1)
        }

        points.push(curr.clone());

        if(i+1 < indexes.length) {
            const next = positions[indexes[i+1]];
            const middle1 = curr.clone().add(next).multiplyScalar(.5)
            middle1.y = curr.y
            points.push(middle1)
        }
    }



    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    //const geometry = new THREE.BufferGeometry().setFromPoints(indexes.map(index => dijkstra[index].node.position));
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 8, transparent: true, opacity:0.75});
    lines?.removeFromParent()
    lines = new THREE.Line(geometry, material)
    lines.raycast = () => {}
    lines.translateY(.5)
    board.add(lines)

}



function onEndAnim ():void {
    lines?.removeFromParent()
    if(Player.current) {
        running_anim = null;
        Player.current.position.copy(Player.current.object.position);
        dijkstra = navigation.dijkstra(Player.current.position, null);
    }
    Render.render()
};

function onEachStep (consumed_stamina:number):void {

    // REMOVE AS LINHAS DESENHADAS
    if(lines) {
        const positions = lines.geometry.attributes.position.array as Float32Array;
        lines.geometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(9), 3));
        lines.geometry.attributes.position.needsUpdate = true;        
    }


    const element:HTMLElement|null = document.querySelector("#hud-stamina")
    if(element)
        element.innerText = consumed_stamina.toFixed(1)
}

/*function getPlayer():PlayerStatus {
    if (Player.current)
        return Player.current;
    return {name: "null", object: new THREE.Mesh(), position: new THREE.Vector3(), standing: true, velocity: 10}
}*/



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
    
    await Player.create(pokemon,  new THREE.Vector3(0,1,0));
    navigation.set(board)

    dijkstra = navigation.dijkstra(Player.current.position, null);
}


async function reset(model:string) {
    running_anim = null;
    await Player.create(model,  new THREE.Vector3(0,1,0));
    dijkstra = navigation.dijkstra(Player.current.position, null);
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




const connection = new Connection();

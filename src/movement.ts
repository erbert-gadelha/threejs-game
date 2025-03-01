import * as THREE from "three";
import { Render } from "./render";
import { PlayerStatus } from "./player";
import Navigation from "./navigation";
import { Dijkstra } from "./graph";
import { Connection } from "./connection";

export default class Movement {
    public static async playStep() {
        const audio = new Audio('/threejs-game/sounds/snow-step.mp3');
        audio.volume = .5;
        audio.currentTime = 0.05;
        audio.play();
    }

    public static async moveTo(player:PlayerStatus, to:THREE.Vector3, dijkstra:Dijkstra[], onEachStep:Function, onEndAnim:Function): Promise<any> {
        const path:number[] = Navigation.getPath_indexes(to, dijkstra)

        Connection.getInstance().send({
                action: 'MOVE',
                path: path
            })

        if (path.length < 2) {
            onEndAnim()
            setTimeout(onEndAnim, 20);
            return;
        }

        const stop_anim = () => {
            player.object.position.set(to_.x, to_.y, to_.z);
            player.object.children[0].rotation.x = 0;
            player.object.children[0].rotation.z = 0;
            //onEndAnim();
            setTimeout(onEndAnim, 20);
            Render.render();
        }

        let i = -1;    
        let from:THREE.Vector3 = dijkstra[path[0]].node.position;
        let to_:THREE.Vector3 = dijkstra[path[0]].node.position;
        let delta = new THREE.Vector3(to_.x-from.x,0,to_.z-from.z).normalize();
        const delta_ = new THREE.Vector3();
        const position = player.position.clone();

        let anim_function:Function = this.walk_standing;
        let distance = 0;
        const clock = new THREE.Clock();

        const moveTo_anim = () => {
            if (i > path.length) {
                stop_anim(); return;
            }

            let relativeVelocity =  player.velocity * clock.getDelta();

            if (relativeVelocity >= distance) {
                position.copy(to_);
                player.position.copy(to_);
    
                if (++i < path.length - 1) {
                    requestAnimationFrame(() => moveTo_anim());
                    if(i>=0) onEachStep(dijkstra[path[i+1]].distance);

                    from =  dijkstra[path[i]].node.position
                    to_ =  dijkstra[path[i + 1]].node.position
                    
                    delta = this.delta2D(to_, from);
                    distance = delta.length();
                    delta = delta.divideScalar(distance);

                    player.object.rotation.y = Math.atan2(delta.x, delta.z);
                    player.object.children[0].rotation.set(0,0,0);

                    if(distance == 2)
                        anim_function = this.jump_horizontal;
                    else if (from.y != to_.y) {
                        distance = 1
                        anim_function = this.jump_vertical;
                    }
                    else
                        anim_function = (player.standing?this.walk_standing:this.walk_not_standing);
                    clock.getDelta();
                } else {
                    stop_anim();
                }
            } else {
                delta_.x = delta.x * relativeVelocity;
                delta_.z = delta.z * relativeVelocity;
                distance = anim_function(player, from, to_, delta_, distance)
                requestAnimationFrame(() => moveTo_anim());
            }

            Render.render();            
        }
        moveTo_anim();
    }

    public static async moveFromPath(player:PlayerStatus, path:number[]): Promise<any> {
        if (path.length < 2)
            return;
        

        const stop_anim = () => {
            player.object.position.set(to_.x, to_.y, to_.z);
            player.object.children[0].rotation.x = 0;
            player.object.children[0].rotation.z = 0;
            Movement.playStep();
            Render.render();
        }

        let i = -1;
        let from:THREE.Vector3 = Navigation.navigation.nodes[path[0]].position;
        let to_:THREE.Vector3 = Navigation.navigation.nodes[path[0]].position;
        let delta = new THREE.Vector3(to_.x-from.x,0,to_.z-from.z).normalize();
        const delta_ = new THREE.Vector3();
        const position = player.position.clone();

        let anim_function:Function = this.walk_standing;
        let distance = 0;
        const clock = new THREE.Clock();

        const moveTo_anim = () => {
            if (i > path.length) {
                stop_anim(); return;
            }


            let relativeVelocity =  player.velocity * clock.getDelta();

            if (relativeVelocity >= distance) {
                position.copy(to_);
                player.position.copy(to_);
    
                if (++i < path.length - 1) {
                    if(i>=0) Movement.playStep();

                    from =  Navigation.navigation.nodes[path[i]].position
                    to_ =  Navigation.navigation.nodes[path[i+1]].position

                    delta = this.delta2D(to_, from);
                    distance = delta.length();
                    delta = delta.divideScalar(distance);                    
                    player.object.rotation.y = Math.atan2(delta.x, delta.z);

                    player.object.children[0].rotation.x = 0;
                    player.object.children[0].rotation.z = 0;

                    if(distance == 2)
                        anim_function = this.jump_horizontal;
                    else if (from.y != to_.y) {
                        distance = 1
                        anim_function = this.jump_vertical;
                    }
                    else
                        anim_function = (player.standing?this.walk_standing:this.walk_not_standing);
                    clock.getDelta();
                    requestAnimationFrame(() => moveTo_anim());
                } else {
                    stop_anim();
                }
            } else {
                delta_.x = delta.x * relativeVelocity;
                delta_.z = delta.z * relativeVelocity;
                distance = anim_function(player, from, to_, delta_, distance)
                requestAnimationFrame(() => moveTo_anim());
            }

            Render.render();            
        }
        moveTo_anim();
    }

    private static delta2D(v1:THREE.Vector3, v2:THREE.Vector3):THREE.Vector3 {
        return new THREE.Vector3(v1.x-v2.x,0,v1.z-v2.z)
    }

    private static jump_vertical(player:PlayerStatus, from:THREE.Vector3, to:THREE.Vector3, delta:THREE.Vector3, progress:number):number{
        
        player.position.add(delta.clone().multiplyScalar(.7)); 
        
        const sin1 = Math.abs(Math.sin(Math.PI*progress))
        const rotation = 10;        

        player.position.copy(player.position);
        player.object.position.y = from.y*progress + to.y*(1-progress) + sin1*.5
        player.object.children[0].rotation.x = sin1*rotation*(Math.PI/180);

        const dist = Math.sqrt(Math.pow(player.position.x - to.x, 2) + Math.pow(player.position.z - to.z, 2));
        return dist;
    }

    private static jump_horizontal(player:PlayerStatus, from:THREE.Vector3, to:THREE.Vector3, delta:THREE.Vector3, progress:number):number {
        player.position.add(delta.clone().multiplyScalar(1.2)); 
        player.position.copy(player.position);

        const sin1 = Math.abs(Math.sin(Math.PI*progress/2))
        player.object.position.y = from.y*progress + to.y*(1-progress) + sin1*.3

        if(player.standing) {
            const sin2 = Math.sin(Math.PI*(progress/2 + 1))
            player.object.children[0].rotation.x = -sin2*15*(Math.PI/180);
        }
        else {
            const sin2 = Math.cos(Math.PI*(progress/2))
            player.object.children[0].rotation.x = sin2*15*(Math.PI/180);
        }

        const dist = Math.sqrt(Math.pow(player.position.x - to.x, 2) + Math.pow(player.position.z - to.z, 2));
        return dist;
    }

    private static walk_standing(player:PlayerStatus, from:THREE.Vector3, to:THREE.Vector3, delta:THREE.Vector3, progress:number):number {
        player.position.add(delta);
        const vel_y = .01;
        const rotation = 5;        
        
        const sin1 = Math.sin(Math.PI*progress*2)
        const sin2 = Math.sin(Math.PI*progress*4)

        player.position.copy(player.position);
        player.object.position.y = from.y*progress + sin2*vel_y + to.y*(1-progress)
        player.object.children[0].rotation.z = sin1*rotation*(Math.PI/180);

        const dist = Math.sqrt(Math.pow(player.position.x - to.x, 2) + Math.pow(player.position.z - to.z, 2));
        return dist;
    }



    private static walk_not_standing(player:PlayerStatus, from:THREE.Vector3, to:THREE.Vector3, delta:THREE.Vector3, progress:number):number {
        player.position.add(delta);
        const vel_y = .1;
        const rotation = 10;        
        
        const sin1 = Math.cos(Math.PI*((1-progress)*1.5 - 1))
        const sin2 = Math.sin(Math.PI*(progress))

        player.position.copy(player.position);
        player.object.position.y = from.y*progress + sin2*vel_y + to.y*(1-progress)
        player.object.children[0].rotation.x = sin1*rotation*(Math.PI/180);

        const dist = Math.sqrt(Math.pow(player.position.x - to.x, 2) + Math.pow(player.position.z - to.z, 2));
        return dist;
    }

}
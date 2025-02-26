import * as THREE from "three";
import { Render } from "./render";
import { Player } from "./player";
import Navigation from "./navigation";
import { Dijkstra } from "./graph";
import { Connection } from "./connection";

export default class Movement {

    static clock = new THREE.Clock();

    public static async moveTo(player:Player, to:THREE.Vector3, dijkstra:Dijkstra[], onEachStep:Function, onEndAnim:Function): Promise<any> {
        const path:number[] = Navigation.getPath_indexes(to, dijkstra)

        Connection.getInstance().sendMessage(path)

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
        const max_step = player.velocity / 60;
    
        let from:THREE.Vector3 = dijkstra[path[0]].node.position;
        let to_:THREE.Vector3 = dijkstra[path[0]].node.position;
        let delta = new THREE.Vector3(to_.x-from.x,0,to_.z-from.z).normalize().multiplyScalar(max_step);
        const delta_ = new THREE.Vector3();
        const position = player.position.clone();

        let anim_function:Function = this.walk_standing;
        let distance = 0;

        const moveTo_anim = () => {
            if (i > path.length) {
                stop_anim(); return;
            }
    
            if (distance <= max_step) {
                position.copy(to_);
                player.position.copy(to_);
    
                if (++i < path.length - 1) {
                    from =  dijkstra[path[i]].node.position
                    to_ =  dijkstra[path[i + 1]].node.position
                    distance = from.distanceTo(to_);
                    if(i>=0)
                        onEachStep(dijkstra[path[i+1]].distance); 
                    
                    delta = this.delta2D(to_, from).normalize().multiplyScalar(max_step);
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
                    this.clock.getDelta();
                }
            } else {
                let deltaTime = this.clock.getDelta();
                if(deltaTime > max_step)
                    deltaTime = max_step                
                delta_.x = delta.x * deltaTime * 60;
                delta_.z = delta.z * deltaTime * 60;
                distance = anim_function(player, from, to_, delta_, distance)
            }

            Render.render();            
            requestAnimationFrame(() => moveTo_anim());
        }
        moveTo_anim();
    }

    private static delta2D(v1:THREE.Vector3, v2:THREE.Vector3):THREE.Vector3 {
        return new THREE.Vector3(v1.x-v2.x,0,v1.z-v2.z)
    }

    private static jump_vertical(player:Player, from:THREE.Vector3, to:THREE.Vector3, delta:THREE.Vector3, progress:number):number{
        
        player.position.add(delta.clone().multiplyScalar(.7)); 
        
        const sin1 = Math.abs(Math.sin(Math.PI*progress))
        const rotation = 10;        

        player.position.copy(player.position);
        player.object.position.y = from.y*progress + to.y*(1-progress) + sin1*.5
        player.object.children[0].rotation.x = sin1*rotation*(Math.PI/180);

        const dist = Math.sqrt(Math.pow(player.position.x - to.x, 2) + Math.pow(player.position.z - to.z, 2));
        return dist;
    }

    private static jump_horizontal(player:Player, from:THREE.Vector3, to:THREE.Vector3, delta:THREE.Vector3, progress:number):number {
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

    private static walk_standing(player:Player, from:THREE.Vector3, to:THREE.Vector3, delta:THREE.Vector3, progress:number):number {
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



    private static walk_not_standing(player:Player, from:THREE.Vector3, to:THREE.Vector3, delta:THREE.Vector3, progress:number):number {
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
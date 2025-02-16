import * as THREE from "three";
import { Render } from "./render";
import { Player } from "./player";

export default class Movement {

    public static async moveTo(player:Player, path:THREE.Vector3[], onFinish:Function): Promise<any> {
        if (path.length < 2) {
            onFinish()
            setTimeout(onFinish, 20);
            return;
        }

    
        //const velocity = 3;
        let vel_y, vel_x, rotation;
        let i = 0;

        const max_step = player.velocity / 60;
    
        let from = path[i];
        let to = path[i + 1];
        let delta = new THREE.Vector3(to.x-from.x,0,to.z-from.z).normalize().multiplyScalar(max_step);
        const position = player.position.clone();
    
        const moveTo_anim = () => {
            if (i > path.length) {
                player.object.position.set(to.x, to.y, to.z);
                player.object.children[0].rotation.x = 0;
                player.object.children[0].rotation.z = 0;
                onFinish();
                setTimeout(onFinish, 20);
                Render.render();
                return;
            }
    
            const v2a = new THREE.Vector2(player.position.x, player.position.z), v2b = new THREE.Vector2(to.x, to.z);
            const distance = v2a.distanceTo(v2b);
            player.object.rotation.y = Math.atan2(delta.x, delta.z);
            if (distance <= max_step) {
                position.set(to.x, to.y, to.z);
                player.position.copy(position);
    
                if (++i < path.length - 1) {
                    from = path[i];
                    to = path[i + 1];
                    delta = new THREE.Vector3(to.x-from.x,0,to.z-from.z).normalize().multiplyScalar(max_step);
                    player.object.rotation.y = Math.atan2(delta.x, delta.z);
                }
            } else {

                if(from.y == to.y) {
                    vel_y = .1; vel_x = 1; 
                } else {
                    vel_y = .7; vel_x = 0.7;
                }


                if(player.standing)
                    rotation = 10*((i%2)*2-1);
                else
                    if (from.y == to.y)
                        rotation = 20; 
                    else
                        rotation = 50;
                
    
                position.add(delta.clone().multiplyScalar(vel_x));
                player.position.copy(position);
                
                const middle = 1-Math.abs(distance-0.5)*2
                player.position.y = from.y*distance + middle*vel_y + to.y*(1-distance);
                if(player.standing)
                    player.object.children[0].rotation.z = ((distance*2-1))*rotation*(Math.PI/180);
                else
                    player.object.children[0].rotation.x = (.5-distance)*rotation*(Math.PI/180);
                    //object.children[0].rotation.x = ((distance*2-1))*rotation*(Math.PI/180);
                Render.render();
            }
            
            requestAnimationFrame(() => moveTo_anim());
        }
        moveTo_anim();
    }
}
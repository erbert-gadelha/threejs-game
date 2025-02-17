import * as THREE from "three";
import { Board } from "./board";
import {Node, Edge} from "./graph"

export default class Navigation {
    private board:Board|null = null;
    private navigation:Navigation|null = null;
    private nodes:Node[] = [];
    private edges:Edge[] = [];
    private currNode:Node|null = null;

    constructor(board:Board|null) {
        if(board)
            this.set(board);

        if(this.navigation)
            this.navigation = this;
    }

    public findNode(position: THREE.Vector3): Node | null {
        let node: Node | null = null;
        this.nodes.forEach((node_: Node) => {
            if (node) return;        
            // Comparação com tolerância
            if (position.distanceTo(node_.position ?? new THREE.Vector3()) < 0.25)
                node = node_;
            
        });
        return node;
    }
    

    public setNode(position:THREE.Vector3):boolean {
        this.currNode = this.findNode(position);
        return this.currNode != null;
    }

    public set(board:Board):void {
        this.board = board;

        


        const nodes_:(Node|null)[][][] = this.board.getNodes();
        this.nodes = [];
        this.edges = [];

        console.log("nodes", nodes_)

        const get:(x:number, y:number, z:number) => Node|null = (x:number, y:number, z:number):Node|null => {
            if(y < 0 || z < 0 || x < 0)
                return null;
            if(y >= nodes_.length || z >= nodes_[0].length || x >= nodes_[0][0].length )
                return null;
            return nodes_[y][z][x];
        }

        const set:(n1:Node|null, n2:Node|null) => boolean = (n1:Node|null, n2:Node|null):boolean => {
            if(n1 && n2) {
                this.drawLine(n1.position, n2.position)
                const delta = n1.position.clone().sub(n2.position);
                this.edges.push({
                    n1: n1,
                    n2: n2,
                    distance: delta.lengthSq()
                });
                return true;
            } else {
                return false;
            }
        }
        

        for(let y=0; y<nodes_.length; y++) {
            for(let z=0; z<nodes_.length; z++) {
                const z_ = z+1;
                for(let x=0; x<nodes_.length; x++) {
                    const currNode = get(x,y,z);                    
                    if(!currNode)
                        continue;

                    this.nodes.push(currNode);
                    let cantJump:boolean = false;  
                    const x_ = x+1;
                  
                    cantJump = set(currNode, get(x_,  y,z))                    
                    cantJump = set(currNode, get(x_,y+1,z)) || cantJump;
                    cantJump = set(currNode, get(x_,y+2,z)) || cantJump;
                    if(!cantJump)
                        set(currNode, get(x_+1,  y,z));                    
                    set(currNode, get(x_,y-1,z));
                    set(currNode, get(x_,y-2,z));


                    cantJump = set(currNode, get(x,  y,z_));
                    cantJump = set(currNode, get(x,y+1,z_)) || cantJump;
                    cantJump = set(currNode, get(x,y+2,z_)) || cantJump;
                    if(!cantJump)
                        set(currNode, get(x,  y,z_+1));                    
                    set(currNode, get(x,y+2,z_));
                    set(currNode, get(x,y-1,z_));
                    set(currNode, get(x,y-2,z_));     
                }                
            }            
        }        
    }


    private drawLine(from:THREE.Vector3, to:THREE.Vector3):void { 
        const delta = from.clone().sub(to);
        from = from.clone();
        to = to.clone();
        from.y += .6;
        to.y += .6;

        delta.multiplyScalar(.7)

        from.sub(delta)
        to.add(delta)


        const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2, transparent: true, opacity: .5 });
        //const material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2});
        const line = new THREE.Line(geometry, material)
        line.raycast = () => {}
        if(this.board)
            this.board.add(line);
    }

    public getInstance():Navigation {
        if(this.navigation)
            return this.navigation;        
        this.navigation = new Navigation(null);
        return this.navigation;
    }


    public findPath(origin:THREE.Vector3, target:THREE.Vector3):THREE.Vector3[] {
        const path:THREE.Vector3[] = [];

        const origin_:Node|null = this.findNode(origin);
        const target_:Node|null = this.findNode(target);
        if(origin_ == null) {
            console.error(`Não foi possível localizar o Tile de origem na posição (${origin.x}, ${origin.y}, ${origin.z})`);
            return [];
        }
        if(target_ == null) {
            console.error(`Não foi possível localizar o Tile de destino na posição (${target.x}, ${target.y}, ${target.z})`);
            return [];
        }        

        const dijkstra:Dijkstra[] = []
        this.nodes.forEach((node:Node) => {
            const distance = (node == origin_)?0:Number.POSITIVE_INFINITY;

            dijkstra.push({
                node: node,
                parent:null,
                distance: distance,
                isVisited:false
            });
        })


        const getVertice = (node:Node):Dijkstra|null => {
            const vertice = dijkstra.find((dij:Dijkstra) => {return (dij.node == node);})
            if(vertice)
                return vertice;
            return null;
        }

        let unvisited = dijkstra.filter((node:Dijkstra) => { return !node.isVisited });
        let count = 0;
        while(unvisited.length > 0 && count++ < 100) {
            const sorted = unvisited.sort((a:Dijkstra, b:Dijkstra) => {return a.distance - b.distance;});
            //console.log("sorted", sorted);

            const vertice = sorted[0];
            vertice.isVisited = true;

            this.getEdges(vertice.node).forEach((edge:Edge) => {
                const other:Dijkstra|null = getVertice((edge.n1 == vertice.node)?edge.n2:edge.n1);
                if(other == null)
                    return;

                const distance_ = vertice.distance + edge.distance;
                if(distance_ < other?.distance) {
                    other.parent = vertice.node;
                    other.distance = distance_;
                }
            })


            unvisited = dijkstra.filter((node:Dijkstra) => { return !node.isVisited });
        }

        
        


        let curr:Dijkstra|null = getVertice(target_);

        while(curr != null) {
            path.unshift(curr.node.position);
            if(curr.parent == null)
                break;
            curr = getVertice(curr.parent);
        }

        if(path.length <= 1)
            console.warn("dijkstra", dijkstra);
        else
            console.log("dijkstra", dijkstra);

        return path;
    }

    private getEdges(node:Node):Edge[] {
        const edges:Edge[] = [];

        this.edges.forEach((edge:Edge) => {
            if(edge.n1 == node || edge.n2 == node)
                edges.push(edge);
        });

        return edges;
    }



}



interface Dijkstra {
    node:Node,
    parent:Node|null,
    distance:number,
    isVisited:boolean
}
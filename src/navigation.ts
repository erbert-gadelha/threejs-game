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
            if (position.distanceTo(node_.object?.position ?? new THREE.Vector3()) < 0.5)
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


        for(let y=0; y<nodes_.length; y++) {
            for(let z=0; z<nodes_.length; z++) {
                const z_ = z+1;
                for(let x=0; x<nodes_.length; x++) {
                    const currNode =  nodes_[y][z][x];
                    if(!currNode)
                        continue;
                    this.nodes.push(currNode);

                    const x_ = x+1;
                    if(x_ < nodes_.length) {
                        const nextNode = nodes_[y][z][x_];
                        if(nextNode)
                            this.edges.push({
                                n1: currNode,
                                n2: nextNode,
                                distance: currNode.position.distanceTo(nextNode.position)
                            });
                    
                        if(y+1 < nodes_.length) {
                            const nextNode_high = nodes_[y+1][z][x_];
                            if(nextNode_high)
                                this.edges.push({
                                    n1: currNode,
                                    n2: nextNode_high,
                                    distance: currNode.position.distanceTo(nextNode_high.position)
                            });
                        }

                        if(y-1 >= 0) {
                            const nextNode_low = nodes_[y-1][z][x_];
                            if(nextNode_low)
                                this.edges.push({
                                    n1: currNode,
                                    n2: nextNode_low,
                                    distance: currNode.position.distanceTo(nextNode_low.position)
                            });
                        }
                    }
                    

                    if(z_ < nodes_.length) {
                        const nextNode = nodes_[y][z_][x];
                        if(nextNode)
                            this.edges.push({
                                n1: currNode,
                                n2: nextNode,
                                distance: currNode.position.distanceTo(nextNode.position)
                        });

                        if(y+1 < nodes_.length) {
                            const nextNode_high = nodes_[y+1][z_][x];
                            if(nextNode_high)
                                this.edges.push({
                                    n1: currNode,
                                    n2: nextNode_high,
                                    distance: currNode.position.distanceTo(nextNode_high.position)
                            });
                        }

                        if(y-1 >= 0) {
                            const nextNode_low = nodes_[y-1][z_][x];
                            if(nextNode_low)
                                this.edges.push({
                                    n1: currNode,
                                    n2: nextNode_low,
                                    distance: currNode.position.distanceTo(nextNode_low.position)
                            });
                        }
                    }      
                }                
            }            
        }
        
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
            console.error(`Não foi possível localizar o Tile de posição (${origin.x}, ${origin.y}, ${origin.z})`);
            return [];
        }
        if(target_ == null) {
            console.error(`Não foi possível localizar o Tile de posição (${target.x}, ${target.y}, ${target.z})`);
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
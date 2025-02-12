import * as THREE from "three";
import { Board } from "./board";
import {Node, Edge} from "./graph"

export default class Navigation {
    private board:Board|null = null;
    private navigation:Navigation|null = null;
    private nodes:Node[] = [];
    private edges:Edge[] = [];

    constructor(board:Board|null) {
        if(board)
            this.set(board);

        if(this.navigation)
            this.navigation = this;
    }

    public set(board:Board):void {
        this.board = board;


        const nodes_:Node[][][] = this.board.getNodes();
        this.nodes = [];
        this.edges = [];


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
                    }

                    if(z_ < nodes_.length) {
                        const nextNode = nodes_[y][z_][x];
                        if(nextNode)
                            this.edges.push({
                                n1: currNode,
                                n2: nextNode,
                                distance: currNode.position.distanceTo(nextNode.position)
                            });
                    }      
                }                
            }            
        }
        
        console.log("nodes", this.nodes);
        console.log("edges", this.edges);

        console.warn("Deve criar um grafo de caminhos possíveis!");
    }

    public getInstance():Navigation {
        if(this.navigation)
            return this.navigation;        
        this.navigation = new Navigation(null);
        return this.navigation;
    }


    public findPath(origin:THREE.Object3D, target:THREE.Object3D):Node[] {
        console.warn("Deve aplicar Diskstra ao grafo existente!");
        const path:Node[] = [];

        const origin_:Node = this.nodes[8];
        const target_:Node = this.nodes[this.nodes.length - 1];        

        const dijkstra:Dijkstra[] = [{
                node: origin_,
                distance: 0,
                isVisited:false
            }
        ]


        dijkstra.sort((a:Dijkstra, b:Dijkstra) => {
            return a.distance - b.distance;
        })

        console.log("dijkstra", dijkstra);
        console.log("dijkstra_edges", this.getEdges(dijkstra[0].node));





        console.log(this.board);
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
    distance:number,
    isVisited:boolean
}
import { EdgeBuilder } from "./EdgeBuilder";
import { DataFrame } from "../../data/DataFrame";
import { GraphImpl } from "../_internal/implementations/GraphImpl";
import { EdgeImpl } from "../_internal/implementations/EdgeImpl";
import { Node } from "../../Node";
import { AbstractGraph } from "../interfaces/AbstractGraph";
import { AbstractEdge } from "../interfaces/AbstractEdge";

export class GraphBuilder<In extends DataFrame, Out extends DataFrame, Builder extends GraphBuilder<In, Out, any>> {
    protected graph: GraphImpl<In, Out>;
    protected previousNodes: Array<Node<any, any>>;

    constructor() {
        this.graph = new GraphImpl<In, Out>();
        this.previousNodes = [this.graph.internalInput];
    }
    
    public to(...nodes: Array<Node<any, any>>): Builder {
        nodes.forEach(node => {
            this.addNode(node);
            this.previousNodes.forEach(prevNode => {
                this.graph.addEdge(new EdgeBuilder<any>()
                .withInput(prevNode)
                .withOutput(node)
                .build());
            });
        });
        this.previousNodes = nodes;
        return (this as unknown) as Builder;
    }

    public addNode(node: Node<any, any>): Builder {
        this.graph.addNode(node);
        return (this as unknown) as Builder;
    }

    public addEdge(edge: AbstractEdge<any>): Builder {
        this.graph.addEdge(edge as EdgeImpl<any>);
        return (this as unknown) as Builder;
    }

    public build(): AbstractGraph<In, Out> {
        // Link last added nodes to the internal output of the graph
        this.previousNodes.forEach(prevNode => {
            this.graph.addEdge(new EdgeBuilder<any>()
            .withInput(prevNode)
            .withOutput(this.graph.internalOutput)
            .build());
        });
        this.graph.getNodes().forEach(node => {
            node.setLogger(this.graph.getLogger());
        });
        this.graph.validate();
        return this.graph;
    }

}

import { EdgeBuilder } from "./EdgeBuilder";
import { DataFrame } from "../../data/DataFrame";
import { GraphImpl } from "../_internal/implementations/GraphImpl";
import { Node } from "../../Node";
import { AbstractGraph } from "../interfaces/AbstractGraph";
import { SourceNode, SinkNode } from "../../nodes";

export class GraphBuilder<In extends DataFrame, Out extends DataFrame, Builder extends GraphBuilder<In, Out, any>> {
    protected graph: GraphImpl<In, Out>;

    protected constructor() {
        this.graph = new GraphImpl<In, Out>();
    }

    public static create<In extends DataFrame, Out extends DataFrame>(): GraphBuilder<In, Out, any> {
        return new GraphBuilder<In, Out, any>();
    }
    
    public from(...nodes: Array<SourceNode<any>>): GraphShapeBuilder<Builder> {
        nodes.forEach(node => {
            this.graph.addNode(node);
        });
        return GraphShapeBuilder.create(this as unknown as Builder, this.graph, nodes.length === 0 ? [this.graph.internalInput] : nodes);
    }

    public build(): Promise<AbstractGraph<In, Out>> {
        return new Promise((resolve, reject) => {
            this.graph.nodes.forEach(node => {
                node.logger = this.graph.logger;
            });
            this.graph.validate();
            Promise.resolve(this.graph.trigger('build', this)).then(_ => {
                resolve(this.graph);
            }).catch(ex => {
                reject(ex);
            });
        });
    }
}

export class GraphShapeBuilder<Builder extends GraphBuilder<any, any, any>> {
    protected graphBuilder: Builder;
    protected previousNodes: Array<Node<any, any>>;
    protected graph: GraphImpl<any, any>;

    protected constructor(graphBuilder: Builder, graph: GraphImpl<any, any>, nodes: Array<Node<any, any>>) {
        this.graphBuilder = graphBuilder;
        this.previousNodes = nodes;
        this.graph = graph;
    }

    public static create<Builder extends GraphBuilder<any, any, any>>(graphBuilder: Builder, graph: GraphImpl<any, any>, nodes: Array<Node<any, any>>) {
        return new GraphShapeBuilder(graphBuilder, graph, nodes);
    }

    public via(...nodes: Array<Node<any, any>>): GraphShapeBuilder<Builder> {
        nodes.forEach(node => {
            this.previousNodes.forEach(prevNode => {
                this.graph.addNode(node);
                this.graph.addEdge(new EdgeBuilder<any>()
                    .withInput(prevNode)
                    .withOutput(node)
                    .build());
            });
        });
        this.previousNodes = nodes;
        return this;
    }

    public to(...nodes: Array<SinkNode<any>>): Builder {
        if (nodes.length !== 0) {
            nodes.forEach(node => {
                this.graph.addNode(node);
                this.previousNodes.forEach(prevNode => {
                    this.graph.addEdge(new EdgeBuilder<any>()
                        .withInput(prevNode)
                        .withOutput(node)
                        .build());
                });
            });
            this.previousNodes = nodes; 
        } else {
            this.previousNodes.forEach(prevNode => {
                this.graph.addEdge(new EdgeBuilder<any>()
                    .withInput(prevNode)
                    .withOutput(this.graph.internalOutput)
                    .build());
            });
        }
        return this.graphBuilder;
    }

}

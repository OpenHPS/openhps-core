import { EdgeBuilder } from "./EdgeBuilder";
import { DataFrame } from "../../data/DataFrame";
import { GraphImpl } from "../_internal/implementations/GraphImpl";
import { Node } from "../../Node";
import { AbstractGraph } from "../interfaces/AbstractGraph";
import { AbstractEdge } from "../interfaces";
import { AbstractSourceNode } from '../../nodes/_internal/interfaces/AbstractSourceNode';
import { AbstractSinkNode } from '../../nodes/_internal/interfaces/AbstractSinkNode';

export class GraphBuilder<In extends DataFrame, Out extends DataFrame, Builder extends GraphBuilder<In, Out, any>> {
    protected graph: GraphImpl<In, Out>;

    constructor() {
        this.graph = new GraphImpl<In, Out>();
    }
    
    public from(...nodes: Array<Node<any, any>>): GraphShapeBuilder<Builder> {
        nodes.forEach(node => {
            this.graph.addNode(node);
            if (node instanceof AbstractSourceNode) {
                this.graph.addEdge(new EdgeBuilder<any>()
                    .withInput(this.graph.internalInput)
                    .withOutput(node)
                    .build());
            }
        });
        return GraphShapeBuilder.createFromBuilder(this as unknown as Builder, this.graph, nodes.length === 0 ? [this.graph.internalInput] : nodes);
    }

    public addNode(node: Node<any, any>): Builder {
        this.graph.addNode(node);
        return this as unknown as Builder;
    }

    public addEdge(edge: AbstractEdge<any>): Builder {
        this.graph.addEdge(edge);
        return this as unknown as Builder;
    }

    public deleteEdge(edge: AbstractEdge<any>): Builder {
        this.graph.deleteEdge(edge);
        return this as unknown as Builder;
    }

    public deleteNode(node: Node<any, any>): Builder {
        this.graph.deleteNode(node);
        return this as unknown as Builder;
    }

    public build(): Promise<AbstractGraph<In, Out>> {
        return new Promise((resolve, reject) => {
            this.graph.nodes.forEach(node => {
                node.logger = this.graph.logger;
            });
            this.graph.validate();
            Promise.resolve(this.graph.emit('build', this)).then(_ => {
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

    public static createFromBuilder<Builder extends GraphBuilder<any, any, any>>(graphBuilder: Builder, graph: GraphImpl<any, any>, nodes: Array<Node<any, any>>) {
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

    public to(...nodes: Array<AbstractSinkNode<any>>): Builder {
        if (nodes.length !== 0) {
            nodes.forEach(node => {
                this.graph.addNode(node);
                this.previousNodes.forEach(prevNode => {
                    this.graph.addEdge(new EdgeBuilder<any>()
                        .withInput(prevNode)
                        .withOutput(node)
                        .build());
                });
                this.graph.addEdge(new EdgeBuilder<any>()
                    .withInput(node)
                    .withOutput(this.graph.internalOutput)
                    .build());
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

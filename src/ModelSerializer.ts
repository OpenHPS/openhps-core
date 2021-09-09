import { DataFrame } from './data';
import { Edge } from './graph';
import { GraphNode } from './graph/_internal/GraphNode';
import { ModelGraph } from './graph/_internal/implementations';
import { Model } from './Model';
import { Node } from './Node';
import { ProcessingNode, SinkNode, SourceNode } from './nodes';
import { Service } from './service';

export class ModelSerializer {
    public static NODES: Map<string, ClassDeclaration<Node<any, any>>> = new Map();
    public static SERVICES: Map<string, ClassDeclaration<Service>> = new Map();
    private static _modules = new Set();

    public static serialize(model: Model): SerializedModel {
        this._initialize();

        const nodes: SerializedNode[] = model.nodes.map(this._serializeNode);
        const edges: SerializedEdge[] = model.edges.map(this._serializeEdge);
        const services: SerializedService[] = model.findAllServices().map(this._serializeService);

        return {
            uid: model.uid,
            name: model.name,
            nodes,
            edges,
            services,
        };
    }

    private static _serializeNode(node: GraphNode<any, any>): SerializedNode {
        return {
            class: node.constructor.name,
            uid: node.uid,
            name: node.name,
            type:
                node instanceof SourceNode
                    ? 'SourceNode'
                    : node instanceof SinkNode
                    ? 'SinkNode'
                    : node instanceof ProcessingNode
                    ? 'ProcessingNode'
                    : 'Unknown',
        };
    }

    private static _serializeEdge(edge: Edge<any>): SerializedEdge {
        return {
            inlet: edge.inputNode.uid,
            outlet: edge.outputNode.uid,
        };
    }

    private static _serializeService(service: Service): SerializedService {
        return {
            class: service.constructor.name,
            uid: service.uid,
        };
    }

    public static deserialize<In extends DataFrame, Out extends DataFrame>(model: SerializedModel): Model<In, Out> {
        this._initialize();

        const modelInstance = new ModelGraph<In, Out>();
        model.nodes.forEach((node) => {
            const classDeclaration = this.NODES.get(node.class);
            const nodeInstance = new classDeclaration.constructor();
            nodeInstance.uid = node.uid;
            nodeInstance.name = node.name;
            modelInstance.addNode(nodeInstance);
        });
        model.edges.forEach((edge) => {
            modelInstance.addEdge(
                new Edge(modelInstance.findNodeByUID(edge.inlet), modelInstance.findNodeByUID(edge.outlet)),
            );
        });
        model.services.forEach((service) => {
            const classDeclaration = this.SERVICES.get(service.class);
            const serviceInstance = new classDeclaration.constructor();
            serviceInstance.uid = service.uid;
            modelInstance.addService(serviceInstance);
        });
        return modelInstance;
    }

    private static _loadClasses(module: NodeModule = require.main): void {
        this._modules.add(module.id);
        Object.keys(module.exports).forEach((key) => {
            const childModule = module.exports[key];
            if (childModule && childModule.prototype instanceof Node) {
                this.NODES.set(key, {
                    constructor: childModule,
                });
            } else if (childModule && childModule.prototype instanceof Service) {
                this.SERVICES.set(key, {
                    constructor: childModule,
                });
            }
        });
        module.children.forEach((module) => {
            if (!this._modules.has(module.id)) {
                this._loadClasses(module);
            }
        });
    }

    private static _initialize(): void {
        if (this.SERVICES.size === 0 || this.NODES.size === 0) {
            this._loadClasses();
            this._modules.clear();
        }
    }
}

/**
 * Serialized model
 */
interface SerializedModel {
    /**
     * UID of the model
     */
    uid: string;
    dependencies?: SerializedDependency[];
    name: string;
    edges: SerializedEdge[];
    nodes: SerializedNode[];
    services: SerializedService[];
}

interface SerializedDependency {
    [key: string]: string;
}

interface SerializedNode {
    class: string;
    uid: string;
    name: string;
    type: string;
}

interface SerializedEdge {
    inlet: string;
    outlet: string;
}

interface SerializedService {
    class: string;
    uid: string;
}

interface ClassDeclaration<T> {
    constructor: new () => T;
}

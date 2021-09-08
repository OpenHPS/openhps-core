import { DataFrame } from './data';
import { Edge } from './graph';
import { GraphNode } from './graph/_internal/GraphNode';
import { ModelGraph } from './graph/_internal/implementations';
import { Model } from './Model';
import { Node } from './Node';
import { Service } from './service';

export class ModelSerializer {
    public static NODES: Map<string, new () => Node<any, any>> = new Map();
    public static SERVICES: Map<string, new () => Service> = new Map();

    public static serialize(model: Model): SerializedModel {
        return {
            uid: model.uid,
            name: model.name,
            nodes: model.nodes.map(this._serializeNode),
            edges: model.edges.map(this._serializeEdge),
            services: model.findAllServices().map(this._serializeService),
        };
    }

    private static _serializeNode(node: GraphNode<any, any>): SerializedNode {
        return {
            class: node.constructor.name,
            uid: node.uid,
            name: node.name,
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
        if (this.SERVICES.size === 0 || this.NODES.size === 0) {
            this._loadClasses();
        }

        const modelInstance = new ModelGraph<In, Out>();
        model.nodes.forEach((node) => {
            const NodeType = this.NODES.get(node.class);
            const nodeInstance = new NodeType();
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
            const ServiceType = this.SERVICES.get(service.class);
            const serviceInstance = new ServiceType();
            serviceInstance.uid = service.uid;
            modelInstance.addService(serviceInstance);
        });
        return modelInstance;
    }

    private static _loadClasses(): void {
        this.NODES.clear();
        this.SERVICES.clear();
        module.children.forEach((module) => {
            Object.keys(module.exports).forEach((key) => {
                if (module.exports[key].prototype instanceof Node) {
                    this.NODES.set(key, module.exports[key]);
                } else if (module.exports[key].prototype instanceof Service) {
                    this.SERVICES.set(key, module.exports[key]);
                }
            });
        });
    }
}

interface SerializedModel {
    uid: string;
    name: string;
    edges: SerializedEdge[];
    nodes: SerializedNode[];
    services: SerializedService[];
}

interface SerializedNode {
    class: string;
    uid: string;
    name: string;
}

interface SerializedEdge {
    inlet: string;
    outlet: string;
}

interface SerializedService {
    class: string;
    uid: string;
}

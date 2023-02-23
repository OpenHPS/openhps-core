import { DataFrame, DataSerializer, Serializable } from './data';
import { ModelGraph } from './graph/_internal/implementations';
import { Model } from './Model';
import { Node } from './Node';
import { Service } from './service';

export class ModelSerializer {
    static NODES: Map<string, ClassDeclaration<Node<any, any>>> = new Map();
    static SERVICES: Map<string, ClassDeclaration<Service>> = new Map();
    private static _modules = new Set();

    static serialize(model: Model): SerializedModel & any {
        return this.serializeNode(model as ModelGraph<any, any>);
    }

    static serializeNode(node: Node<any, any>): any {
        this._initialize();
        return DataSerializer.serialize(node);
    }

    static deserialize<In extends DataFrame, Out extends DataFrame>(model: SerializedModel): Model<In, Out> {
        const deserializedModel = this.deserializeNode(model) as ModelGraph<In, Out> as Model<In, Out>;
        deserializedModel.nodes.forEach((node) => {
            node.graph = deserializedModel;
        });
        return deserializedModel;
    }

    static deserializeNode<In extends DataFrame, Out extends DataFrame>(node: any): Node<In, Out> {
        this._initialize();
        return DataSerializer.deserialize(node) as Node<any, Out>;
    }

    private static _loadClasses(module: NodeModule = require.main): void {
        if (module === undefined) {
            // Use cache instead
            Object.values(require.cache).map((m) => this._loadClasses(m));
            return;
        }
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
            this.SERVICES.forEach((service) => DataSerializer.registerType(service.constructor));
            this.NODES.forEach((node) => DataSerializer.registerType(node.constructor));
        }
    }
}

interface SerializedModel {
    dependencies?: SerializedDependency[];
}

interface SerializedDependency {
    [key: string]: string;
}

interface ClassDeclaration<T> {
    constructor: Serializable<T>;
}

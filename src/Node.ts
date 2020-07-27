import * as uuidv4 from 'uuid/v4';
import { AbstractNode } from "./graph/interfaces/AbstractNode";
import { DataFrame } from "./data/DataFrame";
import { AbstractGraph } from "./graph/interfaces/AbstractGraph";
import { AbstractEdge } from './graph/interfaces/AbstractEdge';
import { DataFrameService } from './service/DataFrameService';
import { AsyncEventEmitter } from './_internal/AsyncEventEmitter';
import { DataObject } from './data';
import { DataObjectService } from './service';

/**
 * The graph node has an input and output [[DataFrame]]
 * 
 * ## Usage
 * 
 */
export abstract class Node<In extends DataFrame | DataFrame[] = DataFrame, Out extends DataFrame | DataFrame[] = DataFrame> extends AsyncEventEmitter implements AbstractNode<In, Out> {
    private _uid: string = uuidv4();
    private _name: string;
    private _graph: AbstractGraph<any, any>;
    private _ready: boolean = false;
    public logger: (level: string, log: any) => void = () => {};

    constructor() {
        super();
        // Set the display name of the node to the type name
        this._name = this.constructor.name;

        this.logger("debug", {
            node: {
                uid: this.uid,
                name: this.name
            },
            message: `Node has been constructed.`,
        });

        this.prependOnceListener('ready', () => {
            this._ready = true;
        });
    }

    public isReady(): boolean {
        return this._ready;
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get graph(): AbstractGraph<any, any> {
        return this._graph;
    }

    public set graph(graph: AbstractGraph<any, any>) {
        this._graph = graph;
    }

    protected get outlets(): Array<AbstractEdge<Out>> {
        const edges = new Array();
        this.graph.edges.forEach(edge => {
            if (edge.inputNode === this) {
                edges.push(edge);
            }
        });
        return edges;
    }

    protected get inlets(): Array<AbstractEdge<In>> {
        const edges = new Array();
        this.graph.edges.forEach(edge => {
            if (edge.outputNode === this) {
                edges.push(edge);
            }
        });
        return edges;
    }

    public get outputNodes(): Array<Node<any, any>> {
        const edges = this.outlets;
        const nodes = new Array();
        edges.forEach(edge => {
            nodes.push(edge.outputNode);
        });
        return nodes;
    }

    public get inputNodes(): Array<Node<any, any>> {
        const edges = this.inlets;
        const nodes = new Array();
        edges.forEach(edge => {
            nodes.push(edge.inputNode);
        });
        return nodes;
    }
    
    /**
     * Get unique identifier of node
     */
    public get uid(): string {
        return this._uid;
    }

    /**
     * Set unique identifier of node
     * @param uid Unique identifier
     */
    public set uid(uid: string) {
        this._uid = uid;
    }

    /**
     * Send a pull request to the node
     * 
     * @param options Pull options
     */
    public pull(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const callbackPromises = new Array();
            this.listeners('pull').forEach(callback => {
                callbackPromises.push(callback());
            });

            if (callbackPromises.length === 0) {
                const pullPromises = new Array();
                this.inputNodes.forEach(node => {
                    pullPromises.push(node.pull());
                });

                Promise.all(pullPromises).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                Promise.all(callbackPromises).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            }
        });
    }

    /**
     * Push data to the node
     * 
     * @param frame Data frame to push
     */
    public push(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (frame === null || frame === undefined) {
                this.logger("warning", {
                    node: {
                        uid: this.uid,
                        name: this.name
                    },
                    message: `Node received null data frame!`,
                });
                return reject();
            }

            this.logger("debug", {
                node: {
                    uid: this.uid,
                    name: this.name
                },
                message: `Node received push`
            });

            const callbackPromises = new Array();
            this.listeners('push').forEach(callback => {
                callbackPromises.push(callback(frame));
            });

            if (callbackPromises.length === 0) {
                const pushPromises = new Array();
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(frame));
                });

                Promise.all(pushPromises).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                Promise.all(callbackPromises).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            }
        });
    }

    /**
     * Get data frame service for a specific frame
     * @param frame Frame to get data frame service for
     */
    protected findDataFrameService<T extends DataFrame | DataFrame>(frame: T): DataFrameService<T> {
        const model = (this.graph as any);
        // Merge the changes in the frame service
        let frameService = model.findDataServiceByName(frame.constructor.name) as DataFrameService<T>;
        if (frameService === null || frameService === undefined) { 
            frameService = model.findDataServiceByName("DataFrame"); 
        }
        return frameService;
    }

    /**
     * Get data frame service for a specific frame
     * @param frame Frame to get data frame service for
     */
    protected findDataObjectService<T extends DataObject | DataObject>(object: T): DataObjectService<T> {
        const model = (this.graph as any);
        // Merge the changes in the object service
        let objectService = model.findDataServiceByName(object.constructor.name) as DataObjectService<T>;
        if (objectService === null || objectService === undefined) { 
            objectService = model.findDataServiceByName("DataObject"); 
        }
        return objectService;
    }

}

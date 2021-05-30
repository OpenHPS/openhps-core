import { DataFrame } from '../data/DataFrame';
import { DataSerializer } from '../data/DataSerializer';
import { PullOptions, PushOptions } from '../graph/options';
import { Model } from '../Model';
import { Node } from '../Node';
import { Service } from './Service';

/**
 * Remote node service
 */
export abstract class RemoteNodeService extends Service {
    protected nodes: Map<string, Node<any, any>> = new Map();
    public model: Model;

    constructor() {
        super();
        this.once('build', this.initialize.bind(this));
    }

    protected initialize(): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    /**
     * Local positioning model push
     *
     * @param {string} uid UID of the node
     * @param {DataFrame | any} frame Data frame
     * @param {PushOptions} options Push options
     */
    localPush(uid: string, frame: any | DataFrame, options?: PushOptions): void {
        options = options || {};
        if (this.nodes.has(uid)) {
            // Parse frame and options
            const frameDeserialized = frame instanceof DataFrame ? frame : DataSerializer.deserialize(frame);
            this.nodes.get(uid).emit('localpush', frameDeserialized, options);
        }
    }

    /**
     * Local positioning model pull
     *
     * @param {string} uid UID of the node
     * @param {PullOptions} options Pull options
     */
    localPull(uid: string, options?: PullOptions): void {
        options = options || {};
        if (this.nodes.has(uid)) {
            this.nodes.get(uid).emit('localpull', options);
        }
    }

    /**
     * Local positioning model event
     *
     * @param {string} uid UID of the node
     * @param {string} event Event name
     * @param {any} arg Argument
     */
    localEvent(uid: string, event: string, arg: any): void {
        if (this.nodes.has(uid)) {
            this.nodes.get(uid).emit('localevent', event, arg);
        }
    }

    /**
     * Send a push to a specific remote node
     *
     * @param {string} uid Remote Node UID
     * @param {DataFrame} frame Data frame to push
     * @param {PushOptions} [options] Push options
     */
    abstract remotePush<T extends DataFrame | DataFrame[]>(uid: string, frame: T, options?: PushOptions): Promise<void>;

    /**
     * Send a pull request to a specific remote node
     *
     * @param {string} uid Remote Node UID
     * @param {PullOptions} [options] Pull options
     */
    abstract remotePull(uid: string, options?: PullOptions): Promise<void>;

    /**
     * Send an error to a remote node
     *
     * @param {string} uid Remote Node UID
     * @param {string} event Event to send
     * @param {any} arg Event argument
     */
    abstract remoteEvent(uid: string, event: string, arg: any): Promise<void>;

    /**
     * Register a node as a remotely available node
     *
     * @param {Node<any, any> | string} node Node to register
     * @returns {RemoteNodeService} Service instance
     */
    registerNode(node: Node<any, any> | string): this {
        const existingNode = node instanceof Node ? node : (this.model.findNodeByUID(node) as Node<any, any>);
        this.nodes.set(existingNode.uid, existingNode);
        this.logger('debug', {
            message: `Registered remote server node ${existingNode.uid}`,
        });
        return this;
    }
}

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
    protected nodes: Set<string> = new Set();
    protected services: Set<string> = new Set();
    public model: Model;

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
            this.model.findNodeByUID(uid).emit('localpush', frameDeserialized, options);
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
            this.model.findNodeByUID(uid).emit('localpull', options);
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
            this.model.findNodeByUID(uid).emit('localevent', event, arg);
        }
    }

    /**
     * Local service call
     *
     * @param {string} uid Service uid
     * @param {string} method Method name
     * @param {any[]} [args] optional arguments
     * @returns {Promise<any> | any | void} service call output
     */
    localServiceCall(uid: string, method: string, ...args: any[]): Promise<any> | any | void {
        if (this.services.has(uid)) {
            const service: any = this.model.findService(uid);
            return service[method](...args);
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
     * Send a remote service call
     *
     * @param {string} uid Service uid
     * @param {string} method Method to call
     * @param {any[]} [args] Optional set of arguments
     */
    abstract remoteServiceCall(uid: string, method: string, ...args: any[]): Promise<any>;

    /**
     * Register a node as a remotely available node
     *
     * @param {Node<any, any> | string} node Node to register
     * @returns {RemoteNodeService} Service instance
     */
    registerNode(node: Node<any, any> | string): this {
        const existingNode = node instanceof Node ? node : (this.model.findNodeByUID(node) as Node<any, any>);
        this.nodes.add(existingNode.uid);
        this.logger('debug', {
            message: `Registered remote server node ${existingNode.uid}`,
        });
        return this;
    }

    /**
     * Register a service to be remotely available
     *
     * @param {Service} service Service to register
     * @returns {RemoteNodeService} Service instance
     */
    registerService(service: Service): this {
        this.services.add(service.uid);
        return this;
    }
}

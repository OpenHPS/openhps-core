import { DataFrame } from '../data/DataFrame';
import { DataSerializer } from '../data/DataSerializer';
import { PullOptions, PushOptions } from '../graph/options';
import { Node } from '../Node';
import { Service } from './Service';

/**
 * Remote node service
 */
export abstract class RemoteNodeService extends Service {
    private _nodes: Map<string, Node<any, any>> = new Map();

    protected onLocalPush(uid: string, serializedFrame: any, options?: PushOptions): void {
        options = options || {};
        if (this._nodes.has(uid)) {
            // Parse frame and options
            const frameDeserialized = DataSerializer.deserialize(serializedFrame);
            this._nodes.get(uid).emit('localpush', frameDeserialized, options);
        }
    }

    protected onLocalPull(uid: string, options?: PullOptions): void {
        options = options || {};
        if (this._nodes.has(uid)) {
            this._nodes.get(uid).emit('localpull', options);
        }
    }

    protected onLocalEvent(uid: string, event: string, arg: any): void {
        if (this._nodes.has(uid)) {
            this._nodes.get(uid).emit('localevent', event, arg);
        }
    }

    /**
     * Send a push to a specific remote node
     *
     * @param {string} uid Remote Node UID
     * @param {DataFrame} frame Data frame to push
     * @param {PushOptions} [options] Push options
     */
    public abstract push<T extends DataFrame | DataFrame[]>(
        uid: string,
        frame: T,
        options?: PushOptions,
    ): Promise<void>;

    /**
     * Send a pull request to a specific remote node
     *
     * @param {string} uid Remote Node UID
     * @param {PullOptions} [options] Pull options
     */
    public abstract pull(uid: string, options?: PullOptions): Promise<void>;

    /**
     * Send an error to a remote node
     *
     * @param {string} uid Remote Node UID
     * @param {string} event Event to send
     * @param {any} arg Event argument
     */
    public abstract sendEvent(uid: string, event: string, arg: any): Promise<void>;

    /**
     * Register a node as a remotely available node
     *
     * @param {Node<any, any>} node Node to register
     * @returns {boolean} Registration success
     */
    public registerNode(node: Node<any, any>): boolean {
        this._nodes.set(node.uid, node);
        this.logger('debug', {
            message: `Registered remote server node ${node.uid}`,
        });
        return true;
    }
}

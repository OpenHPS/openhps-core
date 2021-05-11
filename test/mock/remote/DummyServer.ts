import { DataFrame, DataSerializer, Node, PullOptions, PushOptions, RemoteNodeService } from "../../../src";
import { DummyBroker } from "./DummyBroker";

export class DummyServer extends RemoteNodeService {
    /**
     * Send a push to a specific remote node
     *
     * @param {string} uid Remote Node UID
     * @param {DataFrame} frame Data frame to push
     * @param {PushOptions} [options] Push options
     */
     public push<T extends DataFrame | DataFrame[]>(
        uid: string,
        frame: T,
        options?: PushOptions,
    ): Promise<void> {
        return new Promise((resolve) => {
            DummyBroker.instance.emit("push", this.constructor.name, uid, DataSerializer.serialize({
                frame,
                options
            }));
            resolve();
        });
    }

    /**
     * Send a pull request to a specific remote node
     *
     * @param {string} uid Remote Node UID
     * @param {PullOptions} [options] Pull options
     */
    public pull(uid: string, options?: PullOptions): Promise<void> {
        return new Promise((resolve) => {
            DummyBroker.instance.emit("pull", this.constructor.name, uid, DataSerializer.serialize({
                options
            }));
            resolve();
        });
    }

    /**
     * Send an error to a remote node
     *
     * @param {string} uid Remote Node UID
     * @param {string} event Event to send
     * @param {any} arg Event argument
     */
    public sendEvent(uid: string, event: string, arg: any): Promise<void> {
        return new Promise((resolve) => {
            DummyBroker.instance.emit("event", this.constructor.name, uid, event, arg);
            resolve();
        });
    }

    /**
     * Register a node as a remotely available node
     *
     * @param {Node<any, any>} node Node to register
     * @returns {boolean} Registration success
     */
    public registerNode(node: Node<any, any>): boolean {
        DummyBroker.instance.on('push', (sender, uid, data) => {
            if (sender === this.constructor.name)
                return;
            this.onLocalPush(uid, DataSerializer.deserialize(data));
        });
        DummyBroker.instance.on('pull', (sender, uid, options) => {
            if (sender === this.constructor.name)
                return;
            this.onLocalPull(uid, options);
        });
        DummyBroker.instance.on('event', (sender, uid, event, arg) => {
            if (sender === this.constructor.name)
                return;
            this.onLocalEvent(uid, event, arg);
        });
        return super.registerNode(node);
    }
}

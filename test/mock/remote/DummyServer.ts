import { DataFrame, DataSerializer, Node, PullOptions, PushOptions, RemoteService } from "../../../src";
import { DummyBroker } from "./DummyBroker";

export class DummyServer extends RemoteService {
    constructor() {
        super();
        this.once('build', this.initialize.bind(this));
    }
    
    protected initialize(): Promise<void> {
        return new Promise((resolve) => {
            DummyBroker.instance.on('push', (sender, uid, data) => {
                if (sender === this.constructor.name)
                    return;
                this.localPush(uid, DataSerializer.deserialize(data.frame), data.options);
            });
            DummyBroker.instance.on('pull', (sender, uid, options) => {
                if (sender === this.constructor.name)
                    return;
                this.localPull(uid, options);
            });
            DummyBroker.instance.on('event', (sender, uid, event, arg) => {
                if (sender === this.constructor.name)
                    return;
                this.localEvent(uid, event, arg);
            });
            DummyBroker.instance.on('service', (sender, uuid, uid, method, ...args) => {
                if (sender === this.constructor.name)
                    return;
                Promise.resolve(this.localServiceCall(uid, method, ...args)).then(data => {
                    DummyBroker.instance.emit('service-response', this.constructor.name, uuid, data);
                });
            });
            DummyBroker.instance.on('service-response', (sender, uuid, data) => {
                if (sender === this.constructor.name)
                    return;
                this.promises.get(uuid).resolve(data);
            });
            resolve();
        });
    }

    /**
     * Send a push to a specific remote node
     *
     * @param {string} uid Remote Node UID
     * @param {DataFrame} frame Data frame to push
     * @param {PushOptions} [options] Push options
     */
     public remotePush<T extends DataFrame | DataFrame[]>(
        uid: string,
        frame: T,
        options?: PushOptions,
    ): Promise<void> {
        return new Promise((resolve) => {
            DummyBroker.instance.emit("push", this.constructor.name, uid, {
                frame: DataSerializer.serialize(frame),
                options
            });
            resolve();
        });
    }

    /**
     * Send a pull request to a specific remote node
     *
     * @param {string} uid Remote Node UID
     * @param {PullOptions} [options] Pull options
     */
    public remotePull(uid: string, options?: PullOptions): Promise<void> {
        return new Promise((resolve) => {
            DummyBroker.instance.emit("pull", this.constructor.name, uid, {
                options
            });
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
    public remoteEvent(uid: string, event: string, arg: any): Promise<void> {
        return new Promise((resolve) => {
            DummyBroker.instance.emit("event", this.constructor.name, uid, event, arg);
            resolve();
        });
    }

    /**
     * Send a remote service call
     *
     * @param {string} uid Service uid
     * @param {string} method Method to call 
     * @param {any[]} args Optional set of arguments 
     */
    public remoteServiceCall(uid: string, method: string, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const uuid = this.generateUUID();
            DummyBroker.instance.emit("service", this.constructor.name, uuid, uid, method, ...args);
            this.promises.set(uuid, { resolve, reject });
        });
    }
}

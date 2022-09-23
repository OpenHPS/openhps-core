import { DataFrame } from '../data/DataFrame';
import { PullOptions, PushOptions } from '../graph/options';
import { PushCompletedEvent, PushError } from '../graph/events';
import { Model } from '../Model';
import { Node, NodeOptions } from '../Node';
import { RemoteService, RemotePushOptions, RemotePullOptions } from '../service/RemoteService';
import { Serializable } from '../data/decorators';
import { DataSerializer } from '../data/DataSerializer';

/**
 * A remote node connects to a service in order to provide a remote connection.
 *
 * @category Node
 */
export class RemoteNode<In extends DataFrame, Out extends DataFrame, S extends RemoteService> extends Node<In, Out> {
    protected service: S;
    protected options: RemoteNodeOptions<S>;
    proxyNode: Node<any, any>;

    constructor(options?: RemoteNodeOptions<S>, node?: Node<any, any>) {
        super(options);
        this.proxyNode = node;
        this.options.service = this.options.service || (RemoteService as unknown as Serializable<S>);
        this.options.serialize = this.options.serialize ?? ((object: DataFrame) => DataSerializer.serialize(object));
        this.options.deserialize = this.options.deserialize ?? ((object: any) => DataSerializer.deserialize(object));

        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));
        this.on('error', this._onDownstreamError.bind(this));
        this.on('completed', this._onDownstreamCompleted.bind(this));
        this.on('localpush', this._onLocalPush.bind(this));
        this.on('localpull', this._onLocalPull.bind(this));
        this.on('localevent', this._onLocalEvent.bind(this));
        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service = (this.graph as Model<any, any>).findService<S>(this.options.service as Serializable<S>);
            if (this.service === undefined || this.service === null) {
                return reject(new Error(`Remote service was not added to model!`));
            }
            this.service.registerNode(this).then(resolve).catch(reject);
        });
    }

    private _onPush(frame: In | In[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            // Send push to clients
            this.service.remotePush(this.uid, frame, {
                ...options,
                ...this.options,
            });
            resolve();
        });
    }

    private _onPull(options?: PullOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            // Send pull to clients
            this.service.remotePull(this.uid, options);
            resolve();
        });
    }

    private _onLocalPush(frame: any, options?: RemotePushOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            const frameDeserialized = frame instanceof DataFrame ? frame : this.options.deserialize(frame, options);
            this.outlets.forEach((outlet) => outlet.push(frameDeserialized as any, options));
            resolve();
        });
    }

    private _onLocalPull(options?: RemotePullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.all(this.inlets.map((inlet) => inlet.pull(options)))
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    private _onLocalEvent(event: string, arg: any): void {
        this.inlets.forEach((inlet) => inlet.emit(event, arg));
    }

    private _onDownstreamCompleted(event: PushCompletedEvent): void {
        // Send completed event to client
        this.service.remoteEvent(this.uid, 'completed', event);
    }

    private _onDownstreamError(error: PushError): void {
        // Send error to clients
        this.service.remoteEvent(this.uid, 'error', error);
    }
}

export interface RemoteNodeOptions<S extends RemoteService> extends NodeOptions {
    /**
     * Service to use for the remote note
     *
     * @default RemoteService any remote service
     */
    service?: Serializable<S>;
    serialize?: (obj: DataFrame, options?: RemotePushOptions) => any;
    deserialize?: (obj: any, options?: RemotePushOptions) => DataFrame;
}

import { DataFrame } from '../data/DataFrame';
import { PullOptions, PushOptions } from '../graph/options';
import { PushCompletedEvent, PushError } from '../graph/events';
import { Model } from '../Model';
import { Node, NodeOptions } from '../Node';
import { RemoteNodeService } from '../service/RemoteNodeService';

/**
 * A remote node connects to a service in order to provide a remote connection.
 *
 * @category Node
 */
export class RemoteNode<In extends DataFrame, Out extends DataFrame, S extends RemoteNodeService> extends Node<
    In,
    Out
> {
    private _service: S;

    constructor(options?: RemoteNodeOptions) {
        super(options);

        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));
        this.on('error', this._onDownstreamError.bind(this));
        this.on('completed', this._onDownstreamCompleted.bind(this));
        this.on('localpush', this._onLocalPush.bind(this));
        this.on('localpull', this._onLocalPull.bind(this));
        this.on('localerror', this._onLocalError.bind(this));
        this.on('localcompleted', this._onLocalCompleted.bind(this));
        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._service = (this.graph as Model<any, any>).findService<S>('MQTTServer');
            if (this._service === undefined || this._service === null) {
                return reject(new Error(`Socket server service was not added to model!`));
            }
            this._service.registerNode(this);
            resolve();
        });
    }

    private _onPush(frame: In | In[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            // Send push to clients
            this._service.push(this.uid, frame, options);
            resolve();
        });
    }

    private _onPull(options?: PullOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            // Send pull to clients
            this._service.pull(this.uid, options);
            resolve();
        });
    }

    private _onLocalPush(frame: In | In[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve) => {
            this.outlets.forEach((outlet) => outlet.push(frame as any, options));
            resolve();
        });
    }

    private _onLocalPull(options?: PullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.all(this.inlets.map((inlet) => inlet.pull(options)))
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    private _onLocalError(error: PushError): void {
        this.inlets.forEach((inlet) => inlet.emit('error', error));
    }

    private _onLocalCompleted(event: PushCompletedEvent): void {
        this.inlets.forEach((inlet) => inlet.emit('completed', event));
    }

    private _onDownstreamCompleted(event: PushCompletedEvent): void {
        // Send completed event to client
        this._service.sendEvent(this.uid, 'completed', event);
    }

    private _onDownstreamError(error: PushError): void {
        // Send error to clients
        this._service.sendEvent(this.uid, 'error', error);
    }
}

export type RemoteNodeOptions = NodeOptions;

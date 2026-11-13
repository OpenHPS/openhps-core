import { DataFrame } from '../../data';
import { PushPromise } from '../../graph/PushPromise';
import { Outlet } from '../../graph/Outlet';
import { PushError } from '../../graph/events';
import { Node } from '../../Node';

/**
 * @category Flow shape
 */
export class BalanceNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _busyNodes: Array<Outlet<any>> = [];
    private _frameOutlets: Map<string, Outlet<any>> = new Map();
    private _queue: Array<{
        frame: InOut | InOut[];
        resolve: () => void;
        reject: (ex?: any) => void;
    }> = [];

    constructor() {
        super();
        // A rejected downstream push emits an error event on this node
        // instead of rejecting the outlet's push promise
        this.on('error', this._onDownstreamError.bind(this));
    }

    /**
     * Mark an outlet as busy for a pushed frame
     * @param {Outlet<any>} outlet Outlet to mark as busy
     * @param {InOut | InOut[]} frame Frame assigned to the outlet
     */
    private _assignOutlet(outlet: Outlet<any>, frame: InOut | InOut[]): void {
        this._busyNodes.push(outlet);
        (Array.isArray(frame) ? frame : [frame]).forEach((f) => {
            this._frameOutlets.set(f.uid, outlet);
        });
    }

    /**
     * Release an outlet once its push has settled
     * @param {Outlet<any>} outlet Outlet to release
     * @param {InOut | InOut[]} frame Frame that was assigned to the outlet
     */
    private _releaseOutlet(outlet: Outlet<any>, frame: InOut | InOut[]): void {
        const busyIndex = this._busyNodes.indexOf(outlet);
        if (busyIndex !== -1) {
            this._busyNodes.splice(busyIndex, 1);
        }
        (Array.isArray(frame) ? frame : [frame]).forEach((f) => {
            if (this._frameOutlets.get(f.uid) === outlet) {
                this._frameOutlets.delete(f.uid);
            }
        });
    }

    /**
     * Handle a downstream error by releasing the outlet the frame was assigned to,
     * so a rejected push does not block the outlet forever
     * @param {PushError} error Error event
     */
    private _onDownstreamError(error: PushError): void {
        const outlet = this._frameOutlets.get(error.frameUID);
        if (outlet === undefined) {
            return;
        }
        this._frameOutlets.delete(error.frameUID);
        // The outlet may already have been released and reassigned to another
        // frame (e.g. the remaining frames of an array push), so only release
        // it when no in-flight frame is still mapped to it
        let inFlight = false;
        this._frameOutlets.forEach((assigned) => {
            if (assigned === outlet) {
                inFlight = true;
            }
        });
        if (inFlight) {
            return;
        }
        const busyIndex = this._busyNodes.indexOf(outlet);
        if (busyIndex !== -1) {
            this._busyNodes.splice(busyIndex, 1);
        }
        this._updateQueue();
    }

    public push(frame: InOut | InOut[]): PushPromise<void> {
        return new PushPromise<void>((resolve, reject) => {
            this.logger('debug', `Received a data frame in the balance node ${this.uid}`, frame);

            let assigned = false;
            for (const outlet of this.outlets) {
                if (this._busyNodes.indexOf(outlet) === -1) {
                    // Node is not busy - perform push
                    this._assignOutlet(outlet, frame);
                    assigned = true;
                    outlet
                        .push(frame)
                        .then(() => {
                            this._releaseOutlet(outlet, frame);
                            this._updateQueue();
                            resolve();
                        })
                        .catch((ex) => {
                            this._releaseOutlet(outlet, frame);
                            this._updateQueue();
                            reject(ex);
                        });
                    break; // Stop Assigning
                }
            }
            if (!assigned) {
                // Add to queue
                this._queue.push({ frame, resolve, reject });
            }
        });
    }

    private _updateQueue() {
        if (this._queue.length !== 0) {
            for (const outlet of this.outlets) {
                if (this._busyNodes.indexOf(outlet) === -1) {
                    // Node is not busy - perform push
                    const queue: {
                        frame: InOut | InOut[];
                        resolve: () => void;
                        reject: (ex?: any) => void;
                    } = this._queue.pop();
                    // Mark the outlet as busy before the queued push so a second
                    // queued frame cannot be assigned to the same outlet
                    this._assignOutlet(outlet, queue.frame);
                    outlet
                        .push(queue.frame)
                        .then(() => {
                            this._releaseOutlet(outlet, queue.frame);
                            this._updateQueue();
                            queue.resolve();
                        })
                        .catch((ex) => {
                            this._releaseOutlet(outlet, queue.frame);
                            this._updateQueue();
                            queue.reject(ex);
                        });
                    break; // Stop Assigning
                }
            }
        }
    }
}

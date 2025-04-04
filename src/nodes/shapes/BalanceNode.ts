import { DataFrame } from '../../data';
import { PushPromise } from '../../graph/PushPromise';
import { Outlet } from '../../graph/Outlet';
import { Node } from '../../Node';

/**
 * @category Flow shape
 */
export class BalanceNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _busyNodes: Array<Outlet<any>> = [];
    private _queue: Array<{
        frame: InOut | InOut[];
        resolve: () => void;
        reject: (ex?: any) => void;
    }> = [];

    public push(frame: InOut | InOut[]): PushPromise<void> {
        return new PushPromise<void>((resolve, reject) => {
            this.logger('debug', `Received a data frame in the balance node ${this.uid}`, frame);

            let assigned = false;
            for (const outlet of this.outlets) {
                if (this._busyNodes.indexOf(outlet) === -1) {
                    // Node is not busy - perform push
                    this._busyNodes.push(outlet);
                    assigned = true;
                    outlet
                        .push(frame)
                        .then(() => {
                            this._busyNodes.splice(this._busyNodes.indexOf(outlet), 1);
                            this._updateQueue();
                            resolve();
                        })
                        .catch((ex) => {
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
                    outlet
                        .push(queue.frame)
                        .then(() => {
                            this._busyNodes.splice(this._busyNodes.indexOf(outlet), 1);
                            this._updateQueue();
                            queue.resolve();
                        })
                        .catch((ex) => {
                            this._updateQueue();
                            queue.reject(ex);
                        });
                    break; // Stop Assigning
                }
            }
        }
    }
}

import { DataFrame } from '../../data';
import { Outlet } from '../../graph';
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

    public push(frame: InOut | InOut[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.logger('debug', {
                node: this.uid,
                message: `Received data`,
                frame,
            });

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

import { DataFrame } from "../../data";
import { Node } from "../../Node";
import { AbstractNode } from "../../graph/interfaces";

export class BalanceNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _busyNodes: Array<AbstractNode<any, any>> = new Array();
    private _queue: Array<{frame: InOut | InOut[], resolve: () => void, reject: (ex?: any) => void}> = new Array();

    public push(frame: InOut | InOut[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.logger("debug", {
                node: this.uid,
                message: `Received data`,
                frame,
            });

            let assigned = false;
            for (const node of this.outputNodes) {
                if (this._busyNodes.indexOf(node) === -1) {
                    // Node is not busy - perform push
                    this._busyNodes.push(node);
                    assigned = true;
                    node.push(frame).then(_ => {
                        this._busyNodes.splice(this._busyNodes.indexOf(node), 1);
                        this._updateQueue();
                        resolve();
                    }).catch(ex => {
                        this._updateQueue();
                        reject(ex);
                    });
                    break;  // Stop Assigning
                }
            }
            if (!assigned) {
                // Add to queue
                this._queue.push({frame, resolve, reject});
            }
        });
    }

    private _updateQueue() {
        if (this._queue.length !== 0) {
            for (const node of this.outputNodes) {
                if (this._busyNodes.indexOf(node) === -1) {
                    // Node is not busy - perform push
                    const queue: {frame: InOut | InOut[], resolve: () => void, reject: (ex?: any) => void} = this._queue.pop();
                    node.push(queue.frame).then(_ => {
                        this._busyNodes.splice(this._busyNodes.indexOf(node), 1);
                        this._updateQueue();
                        queue.resolve();
                    }).catch(ex => {
                        this._updateQueue();
                        queue.reject(ex);
                    });
                    break;  // Stop Assigning
                }
            }
        }
    }

}

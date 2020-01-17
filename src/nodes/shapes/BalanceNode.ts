import { DataFrame } from "../../data";
import { Node } from "../../Node";
import { GraphPushOptions } from "../../graph/GraphPushOptions";
import { AbstractNode } from "../../graph/interfaces";

export class BalanceNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    private _busyLayers: Array<AbstractNode<any, any>> = new Array();
    private _queue: Array<{data: InOut, options: GraphPushOptions, resolve: () => void, reject: (ex?: any) => void}> = new Array();

    public push(data: InOut, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let assigned = false;
            this.logger("debug", {
                node: this.uid,
                message: `Received data`,
                data,
            });
            for (const node of this.outputNodes) {
                if (this._busyLayers.indexOf(node) === -1) {
                    // Node is not busy - perform push
                    this._busyLayers.push(node);
                    assigned = true;
                    node.push(data, options).then(_ => {
                        this._busyLayers.splice(this._busyLayers.indexOf(node), 1);
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
                this._queue.push({data, options, resolve, reject});
            }
        });
    }

    private _updateQueue() {
        if (this._queue.length !== 0) {
            for (const node of this.outputNodes) {
                if (this._busyLayers.indexOf(node) === -1) {
                    // Node is not busy - perform push
                    const queue: {data: InOut, options: GraphPushOptions, resolve: () => void, reject: (ex?: any) => void} = this._queue.pop();
                    node.push(queue.data, queue.options).then(_ => {
                        this._busyLayers.splice(this._busyLayers.indexOf(node), 1);
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

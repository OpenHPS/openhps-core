import { DataFrame } from "../../data";
import { Node } from "../../Node";
import { GraphPushOptions } from "../../graph/GraphPushOptions";

export class BroadcastNode<InOut extends DataFrame> extends Node<InOut, InOut> {

    constructor() {
        super();
        this.on('push', this.onPush.bind(this));
    }

    public onPush(data: InOut, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const promises = new Array();
            this.outputNodes.forEach(node => {
                promises.push(node.push(data, options));
            });
            Promise.all(promises).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

}

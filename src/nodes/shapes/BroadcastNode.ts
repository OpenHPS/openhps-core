import { DataFrame } from "../../data";
import { Node } from "../../Node";
import { GraphPushOptions } from "../../utils";

export class BroadcastNode<InOut extends DataFrame> extends Node<InOut, InOut> {

    constructor() {
        super();
        this.on('push', this.onPush.bind(this));
    }

    public onPush(data: InOut, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getOutputNodes().forEach(node => {
                node.push(data, options);
            });
            resolve();
        });
    }

}

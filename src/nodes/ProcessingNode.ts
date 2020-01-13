import { DataFrame } from "../data";
import { Node } from "../Node";
import { GraphPushOptions } from "../utils";

export abstract class ProcessingNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {

    constructor() {
        super();

        this.on('push', this._onPush.bind(this));
    }

    private _onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.process(data, options).then(result => {
                if (result !== null || result !== undefined) {
                    this.getOutputNodes().forEach(node => {
                        node.push(result, options);
                    });
                }
            });
        });
    }

    public abstract process(data: In, options: GraphPushOptions): Promise<Out>;
}

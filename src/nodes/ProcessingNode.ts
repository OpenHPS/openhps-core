import { DataFrame } from "../data";
import { Node } from "../Node";
import { GraphPushOptions, GraphPullOptions } from "../utils";

export abstract class ProcessingNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {

    constructor() {
        super();

        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));
    }

    private _onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.process(data, options).then(result => {
                this.getOutputNodes().forEach(node => {
                    node.push(result, options);
                });
            });
        });
    }

    private _onPull(options?: GraphPullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getInputNodes().forEach(node => {
                node.pull(options);
            });
        });
    }

    public abstract process(data: In, options: GraphPushOptions): Promise<Out>;
}

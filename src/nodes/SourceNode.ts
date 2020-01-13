import { Node } from "../Node";
import { DataFrame } from "../data/DataFrame";
import { GraphPullOptions } from "../utils";

export abstract class SourceNode<Out extends DataFrame> extends Node<Out, Out> {

    constructor() {
        super();
        this.on('pull', this._onPull.bind(this));
    }

    private _onPull(options?: GraphPullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.onPull(options).then(frame => {
                if (frame !== null || frame !== undefined) {
                    this.getOutputNodes().forEach(node => {
                        node.push(frame, options);
                    });
                }
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract onPull(options?: GraphPullOptions): Promise<Out>;

}

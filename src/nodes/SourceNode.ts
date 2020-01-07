import { Node } from "../";
import { DataFrame } from "../data/DataFrame";
import { GraphPullOptions } from "../utils";

export abstract class SourceNode<Out extends DataFrame> extends Node<Out, Out> {

    constructor() {
        super();
        this.on('pull', this.onPull.bind(this));
    }

    public abstract onPull(options?: GraphPullOptions): void;

}

import { DataFrame } from "../../../data";
import { Node } from "../../../Node";
import { GraphPullOptions } from "../../../graph/GraphPullOptions";

export abstract class AbstractSourceNode<Out extends DataFrame> extends Node<Out, Out> {
    public abstract onPull(options?: GraphPullOptions): Promise<Out>;
}

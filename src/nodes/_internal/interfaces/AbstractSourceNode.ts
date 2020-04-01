import { DataFrame } from "../../../data";
import { Node } from "../../../Node";

export abstract class AbstractSourceNode<Out extends DataFrame> extends Node<Out, Out> {
    public abstract onPull(): Promise<Out>;
}

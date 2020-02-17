import { DataFrame } from "../../../data";
import { Node } from "../../../Node";
import { GraphOptions } from "../../../graph/GraphOptions";

export abstract class AbstractSinkNode<In extends DataFrame> extends Node<In, In> {
    public abstract onPush(data: In, options?: GraphOptions): Promise<void>;
}

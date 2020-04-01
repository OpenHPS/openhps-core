import { DataFrame } from "../../../data";
import { Node } from "../../../Node";

export abstract class AbstractSinkNode<In extends DataFrame> extends Node<In, In> {
    public abstract onPush(frame: In): Promise<void>;
}

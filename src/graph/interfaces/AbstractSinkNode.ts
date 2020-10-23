import { DataFrame } from '../../data';
import { Node } from '../../Node';
import { PushOptions } from './PushOptions';

export abstract class AbstractSinkNode<In extends DataFrame> extends Node<In, In> {
    public abstract onPush(frame: In | In[], options?: PushOptions): Promise<void>;
}

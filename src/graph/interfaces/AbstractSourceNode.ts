import { DataFrame } from '../../data';
import { Node } from '../../Node';
import { PullOptions } from './PullOptions';

export abstract class AbstractSourceNode<Out extends DataFrame> extends Node<Out, Out> {
    public abstract onPull(options?: PullOptions): Promise<Out | Out[]>;
}

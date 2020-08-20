import { DataFrame } from '../../data';
import { Node } from '../../Node';

export class BroadcastNode<InOut extends DataFrame> extends Node<InOut, InOut> {}

import { DataFrame } from '../../data';
import { Node } from '../../Node';

/**
 * @category Flow shape
 */
export class BroadcastNode<InOut extends DataFrame> extends Node<InOut, InOut> {}

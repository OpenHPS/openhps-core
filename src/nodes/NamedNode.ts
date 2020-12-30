import { DataFrame } from '../data';
import { Node, NodeOptions } from '../Node';

/**
 * @category Node
 */
export class NamedNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    constructor(name: string, options?: NodeOptions) {
        super({
            name,
            ...options,
        });
    }
}

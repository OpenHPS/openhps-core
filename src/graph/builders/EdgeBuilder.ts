import { DataFrame } from '../../data/DataFrame';
import { Node } from '../../Node';
import { Edge } from '../Edge';

/**
 * Edge builder
 *
 * ## Usage
 * ```typescript
 * const edge = new EdgeBuilder()
 *      .withInput(...)
 *      .withOutput(...)
 *      .build();
 * ```
 */
export class EdgeBuilder<InOut extends DataFrame> {
    private _edge: Edge<InOut>;

    protected constructor() {
        this._edge = new Edge<InOut>();
    }

    public static create<InOut extends DataFrame>(): EdgeBuilder<InOut> {
        return new EdgeBuilder();
    }

    public from(node: Node<any, InOut>): EdgeBuilder<InOut> {
        this._edge.inputNode = node;
        return this;
    }

    public to(node: Node<InOut, any>): EdgeBuilder<InOut> {
        this._edge.outputNode = node;
        return this;
    }

    public build(): Edge<InOut> {
        return this._edge;
    }
}

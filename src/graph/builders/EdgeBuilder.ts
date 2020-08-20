import { DataFrame } from "../../data/DataFrame";
import { EdgeImpl } from "../_internal/implementations/EdgeImpl";
import { AbstractEdge } from "../interfaces/AbstractEdge";
import { AbstractNode } from "../interfaces";

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
    private _edge: EdgeImpl<InOut>;

    protected constructor() {
        this._edge = new EdgeImpl<InOut>();
    }

    public static create<InOut extends DataFrame>(): EdgeBuilder<InOut> {
        return new EdgeBuilder();
    }

    public from(node: AbstractNode<any, InOut>): EdgeBuilder<InOut> {
        this._edge.inputNode = node;
        return this;
    }

    public to(node: AbstractNode<InOut, any>): EdgeBuilder<InOut> {
        this._edge.outputNode = node;
        return this;
    }

    public build(): AbstractEdge<InOut> {
        return this._edge;
    }

}

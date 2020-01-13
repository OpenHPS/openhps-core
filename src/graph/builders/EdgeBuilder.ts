import { DataFrame } from "../../data/DataFrame";
import { EdgeImpl } from "../_internal/implementations/EdgeImpl";
import { AbstractEdge } from "../interfaces/AbstractEdge";
import { AbstractNode } from "../interfaces";

export class EdgeBuilder<InOut extends DataFrame> {
    private _edge: EdgeImpl<InOut>;

    constructor() {
        this._edge = new EdgeImpl<InOut>();
    }

    public withInput(node: AbstractNode<any, InOut>): EdgeBuilder<InOut> {
        this._edge.setInput(node);
        return this;
    }

    public withOutput(node: AbstractNode<InOut, any>): EdgeBuilder<InOut> {
        this._edge.setOutput(node);
        return this;
    }

    public build(): AbstractEdge<InOut> {
        return this._edge;
    }

}
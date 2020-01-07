import { AbstractEdge } from "../../interfaces/AbstractEdge";
import * as uuidv4 from 'uuid/v4';
import { AbstractNode } from "../../interfaces";
import { DataFrame } from "../../../data";

export class EdgeImpl<InOut extends DataFrame> implements AbstractEdge<InOut> {
    private _uid: string = uuidv4();
    private _inputNode: AbstractNode<any, InOut>;
    private _outputNode: AbstractNode<InOut, any>;

    /**
     * Get unique identifier of edge
     */
    public getUID(): string {
        return this._uid;
    }

    /**
     * Set unique identifier of edge
     * @param uid Unique identifier
     */
    public setUID(uid: string): void {
        this._uid = uid;
    }

    public getInputNode(): AbstractNode<any, InOut> {
        return this._inputNode;
    }

    public getOutputNode(): AbstractNode<InOut, any> {
        return this._outputNode;
    }

    public setInput(input: AbstractNode<any, InOut>): void {
        this._inputNode = input;
    }

    public setOutput(output: AbstractNode<InOut, any>): void {
        this._outputNode = output;
    }

    public serialize(): Object {
        return {
            uid: this._uid,
            input: this._inputNode.getUID(),
            output: this._outputNode.getUID()
        };
    }
}

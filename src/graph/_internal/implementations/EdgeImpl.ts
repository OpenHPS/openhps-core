import { AbstractEdge } from "../../interfaces/AbstractEdge";
import { v4 as uuidv4 } from 'uuid';
import { AbstractNode } from "../../interfaces";
import { DataFrame } from "../../../data";

export class EdgeImpl<InOut extends DataFrame> implements AbstractEdge<InOut> {
    private _uid: string = uuidv4();
    private _inputNode: AbstractNode<any, InOut>;
    private _outputNode: AbstractNode<InOut, any>;

    /**
     * Get unique identifier of edge
     */
    public get uid(): string {
        return this._uid;
    }

    /**
     * Set unique identifier of edge
     *
     * @param uid Unique identifier
     */
    public set uid(uid: string) {
        this._uid = uid;
    }

    public get inputNode(): AbstractNode<any, InOut> {
        return this._inputNode;
    }

    public set inputNode(input: AbstractNode<any, InOut>) {
        this._inputNode = input;
    }

    public get outputNode(): AbstractNode<InOut, any> {
        return this._outputNode;
    }

    public set outputNode(output: AbstractNode<InOut, any>) {
        this._outputNode = output;
    }

    /**
     * Push data to the output node
     * 
     * @param frame Data frame to push
     */
    public push(frame: InOut | InOut[]): Promise<void> {
        return this.outputNode.push(frame);
    }

    /**
     * Pull data from the input node
     */
    public pull(): Promise<void> {
        return this.inputNode.pull();
    }
}

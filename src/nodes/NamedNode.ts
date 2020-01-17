import { DataFrame } from "../data";
import { Node } from "../Node";

export class NamedNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {

    constructor(name: string) {
        super();
        this.name = name;
    }

}

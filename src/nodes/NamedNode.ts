import { DataFrame } from "../data";
import { Node } from "../Node";

export class NamedNode<InOut extends DataFrame> extends Node<InOut, InOut> {

    constructor(name: string) {
        super({
            name
        });
    }

}

import { DataFrame } from "../../data";
import { GraphPushOptions } from "../../graph";
import { ProcessingNode } from "../ProcessingNode";
import { TimeUnit } from "../../utils";

export class FrameDebounceNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {

    constructor(timeout: number, timeoutUnit: TimeUnit) {
        super();
    }

    public process(data: InOut, options: GraphPushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
           
        });
    }

}

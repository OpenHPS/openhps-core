import { DataFrame } from "../../data/DataFrame";
import { SinkNode } from "../SinkNode";
import { GraphPushOptions } from "../../graph/GraphPushOptions";

export class StorageSinkNode<In extends DataFrame> extends SinkNode<In> {

    constructor() {
        super();
    }
    
    public onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }
    
} 

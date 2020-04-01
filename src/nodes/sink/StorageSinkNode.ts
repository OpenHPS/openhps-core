import { DataFrame } from "../../data/DataFrame";
import { SinkNode } from "../SinkNode";

export class StorageSinkNode<In extends DataFrame> extends SinkNode<In> {

    constructor() {
        super();
    }
    
    public onPush(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }
    
} 

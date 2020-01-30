import { DataFrame, DataObject } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";

export class FingerprintingProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    constructor(filter?: Array<new() => any>) {
        super(filter);
    }

    public processObject(dataObject: DataObject): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            
        });
    }

}

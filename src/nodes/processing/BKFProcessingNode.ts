import { DataFrame, DataObject } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";

export class BKFProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    constructor() {
        super();
    }

    public processObject(dataObject: DataObject): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            
        });
    }

}

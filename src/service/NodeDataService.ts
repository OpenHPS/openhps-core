import { DataService } from "./DataService";
import { DataObject, } from "../data";

export abstract class NodeDataService<T extends NodeData | NodeData> extends DataService<NodeDataIdentifier, T> {

    constructor(dataType: new () => T, options?: any) {
        super(dataType as new () => T, options);
    }

    public findData(nodeUID: string, dataObject: DataObject): Promise<any> {
        return this.findByUID({
            nodeUID,
            dataObjectUID: dataObject.uid
        });
    }

    public insertData(nodeUID: string, dataObject: DataObject, data: any): Promise<NodeData> {
        return this.insert({
            nodeUID,
            dataObjectUID: dataObject.uid,
            data
        } as any);
    }

}

export interface NodeDataIdentifier {
    nodeUID: string;
    dataObjectUID: string;
}

export class NodeData implements NodeDataIdentifier {
    nodeUID: string;
    dataObjectUID: string;
    data: any;
}

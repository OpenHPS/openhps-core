import { DataService } from "./DataService";
import { DataObject, SerializableObject, SerializableMember, } from "../data";

export abstract class NodeDataService<T extends NodeData | NodeData> extends DataService<string, T> {

    constructor(dataType: new () => T = NodeData as any, options?: any) {
        super(dataType as new () => T, options);
    }

    public findData(nodeUID: string, dataObject: DataObject): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.findByUID(this.getUID(nodeUID, dataObject.uid)).then(nodeData => {
                resolve(nodeData.data);
            }).catch(_ => {
                resolve(undefined);
            });
        });
    }

    public insertData(nodeUID: string, dataObject: DataObject, data: any): Promise<T> {
        return this.insert(new NodeData(this.getUID(nodeUID, dataObject.uid), data) as T);
    }

    protected getUID(nodeUID: string, dataObjectUID: string): string {
        return Buffer.from(nodeUID + dataObjectUID).toString('base64');
    }

}

@SerializableObject()
export class NodeData {
    @SerializableMember()
    uid: string;
    @SerializableMember()
    data: any;

    constructor(uid?: string, data?: any) {
        this.uid = uid;
        this.data = data;
    }

}

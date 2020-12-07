import { DataObject, SerializableMember, SerializableObject } from '../data';
import { DataService } from './DataService';
import { HashUtils } from '../utils/_internal/HashUtils';

export class NodeDataService<T extends NodeData | NodeData> extends DataService<string, T> {
    public findData(nodeUID: string, dataObject: DataObject | string): Promise<any> {
        return new Promise<any>((resolve) => {
            this.findByUID(this.getUID(nodeUID, typeof dataObject === 'string' ? dataObject : dataObject.uid))
                .then((nodeData) => {
                    resolve(nodeData.data);
                })
                .catch(() => {
                    resolve(undefined);
                });
        });
    }

    public insertData(nodeUID: string, dataObject: DataObject | string, data: any): Promise<T> {
        const uid = this.getUID(nodeUID, typeof dataObject === 'string' ? dataObject : dataObject.uid);
        return this.insert(uid, new NodeData(uid, data) as T);
    }

    protected getUID(nodeUID: string, dataObjectUID: string): string {
        return HashUtils.hash(nodeUID + dataObjectUID);
    }
}

@SerializableObject()
export class NodeData {
    @SerializableMember()
    uid: string;
    @SerializableMember({
        serializer: (data) => {
            return data;
        },
        deserializer: (json) => {
            return json;
        },
    })
    data: any;

    constructor(uid?: string, data: any = {}) {
        this.uid = uid;
        this.data = data;
    }
}

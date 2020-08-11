import { DataService } from "./DataService";
import { DataObject, SerializableObject, SerializableMember, } from "../data";
import { FilterQuery } from "./FilterQuery";

export class NodeDataService<T extends NodeData | NodeData> extends DataService<string, T> {
    private _dataService: DataService<string, T>;

    constructor(dataService: DataService<string, T>, dataType: new () => T | NodeData = NodeData) {
        super(dataType as new () => T);
        this._dataService = dataService;
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
        const uid = this.getUID(nodeUID, dataObject.uid);
        return this.insert(uid, new NodeData(uid, data) as T);
    }

    protected getUID(nodeUID: string, dataObjectUID: string): string {
        const str = nodeUID + dataObjectUID;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            // tslint:disable-next-line
            hash = ((hash << 5) - hash) + char;
            // tslint:disable-next-line
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    public findByUID(uid: string): Promise<T> {
        return this._dataService.findByUID(uid);
    }

    public findOne(query?: FilterQuery<T>): Promise<T> {
        return this._dataService.findOne(query);
    }

    public findAll(query?: FilterQuery<T>): Promise<T[]> {
        return this._dataService.findAll(query);
    }

    public insert(id: string, object: T): Promise<T> {
        return this._dataService.insert(id, object);
    }

    public delete(id: string): Promise<void> {
        return this._dataService.delete(id);
    }

    public deleteAll(): Promise<void> {
        return this._dataService.deleteAll();
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

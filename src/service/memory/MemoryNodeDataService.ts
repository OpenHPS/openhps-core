import { NodeDataService, NodeData, NodeDataIdentifier } from "../NodeDataService";

export class MemoryNodeDataService<T extends NodeData | NodeData> extends NodeDataService<T> {
    protected _data: Map<NodeDataIdentifier, T> = new Map();

    public findByUID(uid: NodeDataIdentifier): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this._data.has(uid)) {
                resolve(this._data.get(uid));
            } else {
                reject(`${this.dataType.name} with identifier #${uid} not found!`);
            }
        });
    }

    public findAll(): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const data = new Array();
            this._data.forEach(serializedObject => {
                data.push(serializedObject);
            });
            resolve(data);
        });
    }

    public insert(object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (object.nodeUID !== null && object.dataObjectUID !== null) {
                this._data.set({
                    nodeUID: object.nodeUID,
                    dataObjectUID: object.dataObjectUID
                }, object);
                resolve(object);
            } else {
                resolve();
            }
        });
    }

    public delete(id: NodeDataIdentifier): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._data.has(id)) {
                this._data.delete(id);
                resolve();
            } else {
                reject(`Unable to delete! ${this.dataType.name} with identifier #${id} not found!`);
            }
        });
    }

    public deleteAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._data = new Map();
            resolve();
        });
    }
    
}

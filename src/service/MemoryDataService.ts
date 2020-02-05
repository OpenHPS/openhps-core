import { DataServiceDriver } from "./DataServiceDriver";
import { DataSerializer } from "../data/DataSerializer";

export class MemoryDataService<I, T> extends DataServiceDriver<I, T> {
    protected _data: Map<I, any> = new Map();
    
    public findOne(filter: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            
        });
    }
    
    public findById(id: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this._data.has(id)) {
                resolve(DataSerializer.deserialize(this._data.get(id)));
            } else {
                reject(`${this.dataType.name} with identifier #${id} not found!`);
            }
        });
    }

    public findAll(filter?: any): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const data = new Array();
            this._data.forEach(serializedObject => {
                data.push(DataSerializer.deserialize(serializedObject));
            });
            resolve(data);
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (id !== null) {
                this._data.set(id, DataSerializer.serialize(object));
                resolve(object);
            } else {
                resolve();
            }
        });
    }

    public delete(id: I): Promise<void> {
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

import { JSONPath } from 'jsonpath-plus';
import { DataObjectServiceDriver } from "./DataObjectServiceDriver";
import { AbsoluteLocation } from '../data';

export class MemoryDataServiceDriver<I, T> extends DataObjectServiceDriver<I, T> {
    protected _data: Map<I, T> = new Map();
    
    public findByCurrentLocation(location: AbsoluteLocation): Promise<T[]> {
        return this.findAll();
    }

    public findOne(filter: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {
        });
    }
    
    public findById(id: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this._data.has(id)) {
                resolve(this._data.get(id));
            } else {
                reject(`${this.dataType.name} with identifier #${id} not found!`);
            }
        });
    }

    public findAll(filter?: any): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            if (filter !== undefined) {
                return resolve(JSONPath({ path: filter, json: Array.from(this._data.values()) }));
            }
            
            const data = new Array();
            this._data.forEach(serializedObject => {
                data.push(serializedObject);
            });
            resolve(data);
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (id !== null) {
                this._data.set(id, object);
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

    public get rawData(): Map<I, T> {
        return this._data;
    }
}

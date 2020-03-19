import { DataFrame } from "../data";
import { JSONPath } from 'jsonpath-plus';
import { DataFrameService } from "./DataFrameService";

export class MemoryDataFrameService<T extends DataFrame> extends DataFrameService<T> {
    protected _data: Map<string, T> = new Map();

    public findOne(filter: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {
        });
    }
    
    public findById(id: string): Promise<T> {
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

    public insert(id: string, object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (id !== null) {
                this._data.set(id, object);
                resolve(object);
            } else {
                resolve();
            }
        });
    }

    public delete(id: string): Promise<void> {
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

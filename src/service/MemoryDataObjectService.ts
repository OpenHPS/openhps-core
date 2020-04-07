import { DataObject, AbsoluteLocation } from "../data";
import { JSONPath } from 'jsonpath-plus';
import { DataObjectService } from "./DataObjectService";
import { isArray } from "util";

export class MemoryDataObjectService<T extends DataObject> extends DataObjectService<T> {
    protected _data: Map<string, T> = new Map();

    public findByDisplayName(displayName: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const result = JSONPath({ path: `$[?(@.displayName=="${displayName}")]`, json: Array.from(this._data.values()) });
            const data = new Array();
            if (isArray(result)) {
                result.forEach(r => {
                    data.push(r);
                });
            } else {
                data.push(result);
            }
            resolve(data);
        });
    }

    public findByCurrentLocation(location: AbsoluteLocation): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const result = JSONPath({ path: `$[?(@.currentLocation.point == ${location.point})]`, json: Array.from(this._data.values()) });
            resolve(result);
        });
    }

    public findByPredictedLocation(location: AbsoluteLocation): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {

        });
    }

    public findByUID(uid: string): Promise<T> {
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
            if (object.uid !== null) {
                this._data.set(object.uid, object);
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

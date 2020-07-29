import { DataObject, AbsolutePosition } from "../../data";
import { DataObjectService } from "../DataObjectService";

/**
 * Memory data object service
 *  This service should not be used on a production server
 *  as its quering is not efficient.
 */
export class MemoryDataObjectService<T extends DataObject> extends DataObjectService<T> {
    protected _data: Map<string, T> = new Map();

    public findByDisplayName(displayName: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const result = new Array<T>();
            this._data.forEach(obj => {
                if (obj.displayName === displayName) {
                    result.push(obj);
                }
            });
            resolve(result);
        });
    }

    public findByPosition(position: AbsolutePosition): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const result = new Array<T>();
            this._data.forEach(obj => {
                if (obj.getPosition().equals(position)) {
                    result.push(obj);
                }
            });
            resolve(result);
        });
    }

    public findByParentUID(parentUID: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const result = new Array<T>();
            this._data.forEach(obj => {
                if (obj.parentUID === parentUID) {
                    result.push(obj);
                }
            });
            resolve(result);
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

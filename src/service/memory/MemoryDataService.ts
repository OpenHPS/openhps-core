import { DataService } from "../DataService";

export class MemoryDataService<I, T> extends DataService<I, T> {
    protected _data: Map<I, T> = new Map();

    public findByUID(uid: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this._data.has(uid)) {
                resolve(this._data.get(uid));
            } else {
                reject(`${this.dataType.name} with identifier #${uid} not found!`);
            }
        });
    }

    public findOne(query: (object: T) => boolean = () => true): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            for (const [_, object] of this._data) {
                if (query(object))
                    return resolve(object);
            }
            return resolve();
        });
    }

    public findAll(query: (object: T) => boolean = () => true): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            const data = new Array();
            this._data.forEach(object => {
                if (query(object))
                    data.push(object);
            });
            resolve(data);
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (id && object) {
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
    
}

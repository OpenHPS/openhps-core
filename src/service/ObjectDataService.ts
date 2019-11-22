import { DataService } from "./DataService";
import { DataObject } from "../data";

/**
 * # OpenHPS: Object Data Service
 * The object server manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class ObjectDataService extends DataService<DataObject> {
    protected _objects: Map<string, DataObject> = new Map();

    constructor() {
        super(DataObject);
    }

    public findById(id: string): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (this._objects.has(id)) {
                resolve(this._objects.get(id));
            } else {
                reject();
            }
        });
    }

    public findAll(): Promise<DataObject[]> {
        return new Promise<DataObject[]>((resolve, reject) => {
            resolve(Array.from(this._objects.values()));
        });
    }

    public create(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (this._objects.has(object.getId())) {
                reject();
            } else {
                // Insert new object
                this._objects.set(object.getId(), object);
                resolve(object);
            }
        });
    }

    public update(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (this._objects.has(object.getId())) {
                // Update existing data
                if (this._objects.has(object.getId())) {
                    // Update existing data
                    this._objects.set(object.getId(), object);
                    resolve(object);
                } else {
                   reject();
                }
            }
        });
    }

    public delete(id: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._objects.has(id)) {
                this._objects.delete(id);
                resolve();
            } else {
                reject();
            }
        });
    }

    public deleteAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._objects = new Map();
            resolve();
        });
    }
}

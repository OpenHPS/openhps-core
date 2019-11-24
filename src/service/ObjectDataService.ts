import { DataService } from "./DataService";
import { DataObject } from "../data/object/DataObject";

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

    public findById(uid: string): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (this._objects.has(uid)) {
                resolve(this._objects.get(uid));
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
            if (object.getUID() !== null && this._objects.has(object.getUID())) {
                reject();
            } else {
                // Insert new object
                if (object.getUID() === null) {
                    // Generate new ID if empty
                    object.setUID(this.generateID());
                }
                this._objects.set(object.getUID(), object);
                resolve(object);
            }
        });
    }

    public update(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (object.getUID() === null) {
                reject();
            }
            // Update existing data
            if (this._objects.has(object.getUID())) {
                // Update existing data
                this._objects.set(object.getUID(), object);
                resolve(object);
            } else {
                reject();
            }
        });
    }

    public delete(uid: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._objects.has(uid)) {
                this._objects.delete(uid);
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

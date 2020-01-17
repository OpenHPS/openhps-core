import { DataService } from "./DataService";
import { DataObject } from "../data";

/**
 * The object service manages the data of objects that are currently being
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
            if (object.uid !== null && this._objects.has(object.uid)) {
                this._objects.set(object.uid, object);
                resolve(object);
            } else {
                // Insert new object
                if (object.uid === null) {
                    // Generate new ID if empty
                    object.uid = this.generateID();
                }
                this._objects.set(object.uid, object);
                resolve(object);
            }
        });
    }

    public update(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
                        // Insert new object
            if (object.uid === null) {
                // Generate new ID if empty
                object.uid = this.generateID();
            }
            // Update existing data
            if (this._objects.has(object.uid)) {
                // Update existing data
                this._objects.set(object.uid, object);
                resolve(object);
            } else {
                this._objects.set(object.uid, object);
                resolve(object);
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

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
        super();
   //     this.setType(Object);
    }

    public findById(id: string): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (this._objects.has(id)) {
                resolve(this._objects.get(id));
            } else {
                resolve(null);
            }
        });
    }

    public findAll(): Promise<DataObject[]> {
        return new Promise<DataObject[]>((resolve, reject) => {

        });
    }

    public create(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (this._objects.has(object.getId())) {
                // Update existing data
            } else {
                // Insert new object
                this._objects.set(object.getId(), object);
            }
        });
    }

    public update(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (this._objects.has(object.getId())) {
                // Update existing data
            }
        });
    }

    public delete(object: DataObject): Promise<void> {
        return new Promise<void>((resolve, reject) => {

        });
    }
}

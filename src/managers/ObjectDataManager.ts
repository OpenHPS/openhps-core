import { Object } from "../Object";
import { DataManager } from "./DataManager";

/**
 * # OpenHPS: Object Data Manager
 * The object manager manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class ObjectDataManager extends DataManager<Object>{
    protected _objects: Map<string,Object> = new Map();

    constructor() {
        super(Object);
    }

    /**
     * Find an object by its identifier
     * @param id Object identifier
     */
    public findById(id: string) : Promise<Object> {
        return new Promise<Object>((resolve,reject) => {
            if (this._objects.has(id)){
                resolve(this._objects.get(id));
            }else{
                resolve(null);
            }
        });
    }

    /**
     * Track a new object
     * @param object Object to track
     */
    public track(object: Object) : Promise<Object> {
        return new Promise<Object>((resolve,reject) => {
            if (this._objects.has(object.getId())){
                // Update existing data
            }else{
                // Insert new object
                this._objects.set(object.getId(), object);
            }
        });
    }

    public untrack(object: Object) : Promise<void> {
        return new Promise<void>((resolve,reject) => {

        });
    }
}
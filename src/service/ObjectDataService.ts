import { DataService } from "./DataService";
import { Object } from "../data";

/**
 * # OpenHPS: Object Data Service
 * The object server manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class ObjectDataService extends DataService<Object>{
    protected _objects: Map<string,Object> = new Map();

    constructor() {
        super();
   //     this.setType(Object);
    }

    public findById(id: string) : Promise<Object> {
        return new Promise<Object>((resolve,reject) => {
            if (this._objects.has(id)){
                resolve(this._objects.get(id));
            }else{
                resolve(null);
            }
        });
    }

    public findAll() : Promise<Object[]> {
        return new Promise<Object[]>((resolve,reject) => {

        });
    }

    public create(object: Object) : Promise<Object> {
        return new Promise<Object>((resolve,reject) => {
            if (this._objects.has(object.getId())){
                // Update existing data
            }else{
                // Insert new object
                this._objects.set(object.getId(), object);
            }
        });
    }

    public update(object: Object) : Promise<Object> {
        return new Promise<Object>((resolve,reject) => {
            if (this._objects.has(object.getId())){
                // Update existing data
            }
        });
    }

    public delete(object: Object) : Promise<void> {
        return new Promise<void>((resolve,reject) => {

        });
    }
}
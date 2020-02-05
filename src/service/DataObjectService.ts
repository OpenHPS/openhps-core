import { DataServiceDriver } from "./DataServiceDriver";
import { DataService } from "./DataService";
import { DataObject } from "../data";

/**
 * The object service manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class DataObjectService<T extends DataObject> extends DataService<string, DataObject> {

    constructor(dataType: new () => T | DataObject = DataObject, dataServiceDriver?: new (dataType: new () => T, options?: any) => DataServiceDriver<string, T>, options?: any) {
        super(dataType as new () => T, dataServiceDriver, options);
    }

}

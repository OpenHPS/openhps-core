import { DataService } from "./DataService";
import { DataObject } from "../data";
import { DataObjectServiceDriver } from "./DataObjectServiceDriver";

/**
 * The object service manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class DataObjectService<T extends DataObject> extends DataService<string, DataObject> {

    constructor(dataType: new () => T | DataObject = DataObject, dataServiceDriver?: new (dataType: new () => T, options?: any) => DataObjectServiceDriver<string, T>, options?: any) {
        super(dataType as new () => T, dataServiceDriver, options);
    }

}

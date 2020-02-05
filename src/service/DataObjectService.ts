import { DataServiceDriver } from "./DataServiceDriver";
import { DataService } from "./DataService";
import { DataObject } from "../data";

/**
 * The object service manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class DataObjectService<T extends DataObject> extends DataService<string, DataObject> {

    constructor(dataServiceDriver?: new (dataType: new () => T) => DataServiceDriver<string, T>, dataType: new () => T | DataObject = DataObject) {
        super(dataServiceDriver, dataType as new () => T,);
    }

}

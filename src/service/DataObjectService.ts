import { DataObject } from "../data";
import { MemoryDataService } from "./MemoryDataService";

/**
 * The object service manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class DataObjectService<T extends DataObject | DataObject> extends MemoryDataService<string, T> {

    constructor(dataType: new () => T | DataObject = DataObject) {
        super(dataType as new () => T);
    }

}

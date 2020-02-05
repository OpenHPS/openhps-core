import { DataFrame } from "../data";
import { DataService } from "./DataService";
import { DataServiceDriver } from "./DataServiceDriver";

export class DataFrameService<T extends DataFrame> extends DataService<string, DataFrame> {

    constructor(dataType: new () => T | DataFrame = DataFrame, dataServiceDriver?: new (dataType: new () => T, options?: any) => DataServiceDriver<string, T>, options?: any) {
        super(dataType as new () => T, dataServiceDriver, options);
    }

}

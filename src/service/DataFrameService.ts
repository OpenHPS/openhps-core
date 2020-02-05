import { DataFrame } from "../data";
import { DataService } from "./DataService";
import { DataServiceDriver } from "./DataServiceDriver";

export class DataFrameService<T extends DataFrame> extends DataService<string, DataFrame> {

    constructor(dataServiceDriver?: new (dataType: new () => T) => DataServiceDriver<string, T>, dataType: new () => T | DataFrame = DataFrame) {
        super(dataServiceDriver, dataType as new () => T);
    }

}

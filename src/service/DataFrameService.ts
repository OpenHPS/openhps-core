import { DataFrame } from "../data";
import { DataService } from "./DataService";

export class DataFrameService<T extends DataFrame> extends DataService<string, DataFrame> {

    constructor(dataType: new () => T | DataFrame = DataFrame, options?: any) {
        super(dataType as new () => T, options);
    }

}

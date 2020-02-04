import { DataFrame } from "../data";
import { MemoryDataService } from "./MemoryDataService";

export class DataFrameService<T extends DataFrame | DataFrame> extends MemoryDataService<string, T> {
  
    constructor(dataType: new () => T | DataFrame = DataFrame) {
        super(dataType as new () => T);
    }

}

import { DataFrame } from "../data";
import { DataService } from "./DataService";

export abstract class DataFrameService<T extends DataFrame> extends DataService<string, DataFrame> {
    
    constructor(dataType: new () => T | DataFrame = DataFrame, options?: any) {
        super(dataType as new () => T, options);
    }

    public abstract findByDataObjectUID(uid: string): Promise<T[]>;

    public abstract findBefore(timestamp: number): Promise<T[]>;

    public abstract findAfter(timestamp: number): Promise<T[]>;

}

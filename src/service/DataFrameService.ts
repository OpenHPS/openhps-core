import { DataFrame } from "../data";
import { DataService } from "./DataService";

export abstract class DataFrameService<T extends DataFrame> extends DataService<string, DataFrame> {
    
    constructor(dataType: new () => T | DataFrame = DataFrame, options?: any) {
        super(dataType as new () => T, options);
    }

    public abstract findOne(filter: any): Promise<T>;
    
    public abstract findById(id: string): Promise<T>;

    public abstract findAll(filter?: any): Promise<T[]>;

    public abstract insert(id: string, object: T): Promise<T>;

    public abstract delete(id: string): Promise<void>;

    public abstract deleteAll(): Promise<void>;

}

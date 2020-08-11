import { DataFrame } from "../data";
import { DataService } from "./DataService";
import { FilterQuery } from "./FilterQuery";
import { DataServiceImpl } from "./DataServiceImpl";

export class DataFrameService<T extends DataFrame> extends DataServiceImpl<string, DataFrame> {

    constructor(dataService: DataService<string, T>, dataType: new () => T | DataFrame = DataFrame) {
        super(dataService, dataType as new () => T);
    }

    public findByDataObjectUID(uid: string): Promise<T[]> {
        return this.findAll({
            _objects: {
                $elemMatch: {
                    uid
                }
            }
        }) as Promise<T[]>;
    }

    public findBefore(timestamp: number): Promise<T[]> {
        const filter: FilterQuery<any> = {
            createdTimestamp: { $lte: timestamp }
        };
        return this.findAll(filter) as Promise<T[]>;
    }

    public findAfter(timestamp: number): Promise<T[]> {
        const filter: FilterQuery<any> = {
            createdTimestamp: { $gte: timestamp }
        };
        return this.findAll(filter) as Promise<T[]>;
    }

}

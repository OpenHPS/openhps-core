import { DataFrame } from "../data";
import { FilterQuery } from "./FilterQuery";
import { DataService } from "./DataService";

export class DataFrameService<T extends DataFrame> extends DataService<string, DataFrame> {

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

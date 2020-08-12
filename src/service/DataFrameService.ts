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
        return this._findTimestamp({ $lte: timestamp });
    }

    public findAfter(timestamp: number): Promise<T[]> {
        return this._findTimestamp({ $gte: timestamp });
    }

    private _findTimestamp(timestampFilter: any): Promise<T[]> {
        const filter: FilterQuery<any> = {
            createdTimestamp: timestampFilter
        };
        return this.findAll(filter) as Promise<T[]>;
    }

}

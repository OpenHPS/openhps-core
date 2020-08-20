import { DataFrame } from '../data';
import { FilterQuery } from './FilterQuery';
import { DataService } from './DataService';

export class DataFrameService<T extends DataFrame> extends DataService<string, T> {
    public findByDataObjectUID(uid: string): Promise<T[]> {
        const filter: FilterQuery<any> = {
            _objects: {
                $elemMatch: {
                    uid,
                },
            },
        };
        return this.findAll(filter) as Promise<T[]>;
    }

    /**
     * Find data frames created before a certain timestamp
     *
     * @param timestamp
     */
    public findBefore(timestamp: number): Promise<T[]> {
        return this._findTimestamp({ $lte: timestamp });
    }

    /**
     * Find data frames created after a certain timestamp
     *
     * @param timestamp
     */
    public findAfter(timestamp: number): Promise<T[]> {
        return this._findTimestamp({ $gte: timestamp });
    }

    private _findTimestamp(timestampFilter: any): Promise<T[]> {
        const filter: FilterQuery<any> = {
            createdTimestamp: timestampFilter,
        };
        return this.findAll(filter) as Promise<T[]>;
    }
}

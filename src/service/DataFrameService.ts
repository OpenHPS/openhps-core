import { DataFrame } from '../data';
import { FilterQuery } from './FilterQuery';
import { DataService } from './DataService';

export class DataFrameService<T extends DataFrame> extends DataService<string, T> {
    /**
     * Find data frames that are being processed, containing an specific object
     *
     * @param {string} uid Data object uid
     * @returns {DataFrame[]} Array of data frames
     */
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
     * @param {number} timestamp Timestamp
     * @returns {DataFrame[]} Array of data frames before the specified timestamp
     */
    public findBefore(timestamp: number): Promise<T[]> {
        return this._findTimestamp({ $lte: timestamp });
    }

    /**
     * Find data frames created after a certain timestamp
     *
     * @param {number} timestamp Timestamp
     * @returns {DataFrame[]} Array of data frames after the specified timestamp
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

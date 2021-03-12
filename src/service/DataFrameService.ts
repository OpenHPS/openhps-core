import { DataFrame } from '../data';
import { DataService } from './DataService';
import { DataServiceDriver } from './DataServiceDriver';

/**
 * The data frame service manages storage of complete data frames.
 */
export class DataFrameService<T extends DataFrame> extends DataService<string, T> {
    constructor(dataServiceDriver?: DataServiceDriver<string, T>) {
        super(dataServiceDriver);
        this.driver.once('ready', this._createIndexes.bind(this));
    }

    private _createIndexes(): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([this.createIndex('uid'), this.createIndex('createdTimestamp')])
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
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
        return this.findAll({
            createdTimestamp: timestampFilter,
        }) as Promise<T[]>;
    }
}

import { DataFrame } from '../data/DataFrame';
import { DataService } from './DataService';
import { DataServiceDriver } from './DataServiceDriver';
import { FindOptions } from './FindOptions';

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
     * Insert a new data frame
     *
     * @param {DataFrame} frame Data frame to insert
     * @returns {DataFrame} Inserted frame
     */
    public insertFrame(frame: T): Promise<T> {
        return this.insert(frame.uid, frame);
    }

    /**
     * Find data frames created before a certain timestamp
     *
     * @param {number} timestamp Timestamp
     * @param {FindOptions} [options] Find options
     * @returns {DataFrame[]} Array of data frames before the specified timestamp
     */
    public findBefore(timestamp: number, options?: FindOptions): Promise<T[]> {
        return this._findTimestamp({ $lte: timestamp }, options);
    }

    /**
     * Find data frames created after a certain timestamp
     *
     * @param {number} timestamp Timestamp
     * @param {FindOptions} [options] Find options
     * @returns {DataFrame[]} Array of data frames after the specified timestamp
     */
    public findAfter(timestamp: number, options?: FindOptions): Promise<T[]> {
        return this._findTimestamp({ $gte: timestamp }, options);
    }

    private _findTimestamp(timestampFilter: any, options?: FindOptions): Promise<T[]> {
        return this.findAll(
            {
                createdTimestamp: timestampFilter,
            },
            options,
        ) as Promise<T[]>;
    }
}

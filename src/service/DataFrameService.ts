import { DataObject } from '../data';
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

    /**
     * Find data frames by data object
     *
     * @param {DataObject | string} dataObject Data object to get frames for
     * @param {FindOptions} [options] Find options. By default sorted by createdTimestamp in descending order
     * @returns {DataFrame[]} Array of data frames that contain the specified object
     */
    public findByDataObject(dataObject: DataObject | string, options?: FindOptions): Promise<T[]> {
        return this.findAll(
            {
                objects: {
                    $elemMatch: {
                        uid: dataObject instanceof DataObject ? dataObject.uid : dataObject,
                    },
                },
            },
            options || {
                sort: [['createdTimestamp', -1]],
            },
        );
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

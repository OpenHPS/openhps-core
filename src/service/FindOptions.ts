import { Serializable } from 'typedjson';

export interface FindOptions {
    /**
     * Overwrite the data type for this query
     */
    dataType?: Serializable<any>;
    /**
     * Limit of records to retrieve
     */
    limit?: number;
    /**
     * Sort keys
     */
    sort?: Sort;
}

export declare type Sort = [string, SortDirection][];

export declare type SortDirection = 1 | -1;

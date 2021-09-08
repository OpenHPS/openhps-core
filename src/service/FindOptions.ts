export interface FindOptions {
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

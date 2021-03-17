export interface FindOptions {
    /**
     * Limit of records to retrieve
     */
    limit?: number;
    /**
     * Sort keys
     */
    sort?: Array<[string, number]>;
}

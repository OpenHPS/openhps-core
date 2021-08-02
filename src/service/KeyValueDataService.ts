import { DataService } from './DataService';
import { DataServiceDriver } from './DataServiceDriver';
import { MemoryDataService } from './MemoryDataService';

/**
 * Basic key value data service. This data service can be used to communicate
 * between workers and the main thread.
 */
export class KeyValueDataService extends DataService<string, any> {
    constructor(uid?: string, dataServiceDriver?: DataServiceDriver<string, any>) {
        super(dataServiceDriver);
        if (!dataServiceDriver) {
            this.driver = new MemoryDataService(
                Object,
                (a) => a,
                (b) => b,
            );
            this.dataType = Object;
        }
        this.uid = uid;
    }

    /**
     * Get the value of a key
     *
     * @param {string} key Key
     * @returns {Promise<any>} Promise of the value
     */
    public getValue(key: string): Promise<any> {
        return this.findByUID(key);
    }

    /**
     * Set a value
     *
     * @param {string} key Key to use
     * @param {any} value Value to store
     * @returns {Promise<void>} Promise of setting the value
     */
    public setValue(key: string, value: any): Promise<void> {
        this.emit('set', key, value);
        return this.insert(key, value);
    }
}

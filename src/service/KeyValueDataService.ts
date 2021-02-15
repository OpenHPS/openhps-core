import { DataService } from "./DataService";
import { DataServiceDriver } from "./DataServiceDriver";
import { MemoryDataService } from "./MemoryDataService";

/**
 * Basic key value data service. This data service can be used to communicate
 * between workers and the main thread.
 */
export class KeyValueDataService extends DataService<string, any> {

    constructor(name: string, dataServiceDriver?: DataServiceDriver<string, any>) {
        super(dataServiceDriver);
        if (!dataServiceDriver) {
            this.driver = new MemoryDataService(Object, (a) => a, (b) => b);
            this.dataType = Object;
        }
        this.name = name;
    }

    public get(key: string): Promise<any> {
        return this.findByUID(key);
    }

    public set(key: string, value: any): Promise<void> {
        return this.insert(key, value);
    }

}

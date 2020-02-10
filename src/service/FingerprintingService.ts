import { Fingerprint } from "../data";
import { DataService } from "./DataService";
import { DataServiceDriver } from "./DataServiceDriver";

export class FingerprintingService extends DataService<string, Fingerprint> {

    constructor(dataServiceDriver?: new (dataType: new () => Fingerprint, options?: any) => DataServiceDriver<string, Fingerprint>, options?: any) {
        super(Fingerprint, dataServiceDriver, options);
    }

}

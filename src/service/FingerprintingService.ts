import { Fingerprint, AbsoluteLocation } from "../data";
import { DataObjectService } from "./DataObjectService";
import { DataObjectServiceDriver } from "./DataObjectServiceDriver";

export class FingerprintingService extends DataObjectService<Fingerprint> {

    constructor(dataServiceDriver?: new (dataType: new () => Fingerprint, options?: any) => DataObjectServiceDriver<string, Fingerprint>, options?: any) {
        super(Fingerprint, dataServiceDriver, options);
    }

    public findByCurrentLocation(location: AbsoluteLocation): Promise<Fingerprint[]> {
        return (this.dataService as DataObjectServiceDriver<string, Fingerprint>).findByCurrentLocation(location);
    }

}

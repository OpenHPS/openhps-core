import { Fingerprint, RelativeLocation } from "../data";
import { DataService } from "./DataService";
import { DataServiceDriver } from "./DataServiceDriver";

export class FingerprintingService extends DataService<string, Fingerprint> {

    constructor(dataServiceDriver?: new (dataType: new () => Fingerprint, options?: any) => DataServiceDriver<string, Fingerprint>, options?: any) {
        super(Fingerprint, dataServiceDriver, options);
    }

    public findFingerprintByRelativeLocations(relativeLocations: RelativeLocation[]): Promise<Fingerprint> {
        return new Promise<Fingerprint>((resolve, reject) => {

        });
    }
}

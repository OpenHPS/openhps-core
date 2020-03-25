import { DataFrame, DataObject, RelativeDistanceLocation, Fingerprint } from "../../../data";
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { Model } from "../../../Model";
import { DataObjectService } from "../../../service";

/**
 * Fingerprinting processing node
 */
export class FingerprintingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    constructor(filter?: Array<new() => any>) {
        super(filter);
    }
    
    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            // Fingerprinting service
            const fingerprintService = (this.graph as Model<any, any>).findDataService(Fingerprint) as DataObjectService<Fingerprint>;
            
            if (dataObject.currentLocation !== undefined) {
                // Perform fingerprint calibration
                const fingerprint = new Fingerprint();
                fingerprint.createdTimestamp = dataFrame.createdTimestamp;
                fingerprint.currentLocation = dataObject.currentLocation;
                // Merge fingerprint with previous scans
                dataObject.relativeLocations.forEach(relativeLocation => {
                    if (relativeLocation instanceof RelativeDistanceLocation) {
                        fingerprint.addRelativeLocation(relativeLocation);
                    }
                });
                fingerprintService.insert(fingerprint).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                resolve(dataObject);
            }
        });
    }

}

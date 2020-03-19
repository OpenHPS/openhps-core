import { DataFrame, DataObject, RelativeDistanceLocation, Fingerprint } from "../../../data";
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { Model } from "../../../Model";
import { DataObjectService } from "../../../service";

/**
 * Fingerprinting processing node
 */
export class KNNFingerprintingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

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
                fingerprintService.findByCurrentLocation(dataObject.currentLocation).then(fingerprints => {
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
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                // Perform reverse fingerprinting
                const distances = new Map<string, Number>();
                dataObject.relativeLocations.forEach(relativeLocation => {
                    if (relativeLocation instanceof RelativeDistanceLocation) {
                        distances.set(relativeLocation.referenceObjectUID, relativeLocation.distance);
                    }
                });
                fingerprintService.findAll().then(fingerprints => {
                    fingerprints.forEach(fingerprint => {
                        fingerprint.relativeLocations.forEach(relativeLocation => {

                        });
                    });
                }).catch(ex => {
                    reject(ex);
                });
                // dataObject.addPredictedLocation(fingerprint.currentLocation);
            }
        });
    }

}

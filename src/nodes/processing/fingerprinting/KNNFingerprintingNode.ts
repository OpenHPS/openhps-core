import { DataFrame, DataObject, RelativeDistanceLocation, Fingerprint } from "../../../data";
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { Model } from "../../../Model";
import { FingerprintingService } from "../../../service/FingerprintingService";

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
            const fingerprintService = (this.graph as Model<any, any>).findServiceByClass(FingerprintingService);
            
            if (dataObject.currentLocation !== undefined) {
                // Perform fingerprint calibration
                const fingerprint = new Fingerprint();
                fingerprint.createdTimestamp = dataFrame.createdTimestamp;
                fingerprint.currentLocation = dataObject.currentLocation;
                dataObject.relativeLocations.forEach(relativeLocation => {
                    if (relativeLocation instanceof RelativeDistanceLocation) {
                        fingerprint.addRelativeLocation(relativeLocation);
                    }
                });
                fingerprintService.insert(fingerprint.uid, fingerprint);
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

import { DataFrame, DataObject, RelativeDistanceLocation, Fingerprint } from "../../../data";
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { Model } from "../../../Model";
import { FingerprintingService } from "../../../service/FingerprintingService";

/**
 * Fingerprinting processing node
 */
export class FingerprintingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    constructor(filter?: Array<new() => any>) {
        super(filter);
    }
    
    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const fingerprintService = (this.graph as Model<any, any>).findServiceByClass(FingerprintingService);
            
            if (dataObject.currentLocation !== undefined) {
                // Perform fingerprint calibration
                dataObject.relativeLocations.forEach(relativeLocation => {
                    if (relativeLocation instanceof RelativeDistanceLocation) {
                        const fingerprint = new Fingerprint(relativeLocation);
                        fingerprint.currentLocation = dataObject.currentLocation;
                        fingerprint.createdTimestamp = dataFrame.createdTimestamp;
                        fingerprintService.insert(fingerprint.uid, fingerprint);
                    }
                });
            } else {
                // Perform reverse fingerprinting
                const distances = new Map<string, Number>();
                dataObject.relativeLocations.forEach(relativeLocation => {
                    if (relativeLocation instanceof RelativeDistanceLocation) {
                        distances.set(relativeLocation.referenceObjectUID, relativeLocation.distance);
                    }
                });
                const fingerprint: Fingerprint = null;

                dataObject.addPredictedLocation(fingerprint.currentLocation);
            }
        });
    }

}

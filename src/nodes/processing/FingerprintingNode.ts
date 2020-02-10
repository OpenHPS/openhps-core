import { DataFrame, DataObject, RelativeDistanceLocation, Fingerprint } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";
import { Model } from "../../Model";
import { FingerprintingService } from "../../service/FingerprintingService";

/**
 * Fingerprinting processing node
 */
export class FingerprintingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    constructor(filter?: Array<new() => any>) {
        super(filter);
    }

    private _onBuild(): void {
        
    }

    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const fingerprintService = (this.graph as Model<any, any>).findServiceByClass(FingerprintingService);
            
            if (dataObject.absoluteLocation !== undefined) {
                // Perform fingerprint calibration
                dataObject.relativeLocations.forEach(relativeLocation => {
                    if (relativeLocation instanceof RelativeDistanceLocation) {
                        const fingerprint = new Fingerprint();
                        fingerprint.referenceObject = relativeLocation.referenceObjectUID;
                        fingerprint.referenceValue = relativeLocation.distance;
                        fingerprint.absoluteLocation = dataObject.absoluteLocation;
                        fingerprint.createdTimestamp = dataFrame.createdTimestamp;
                        fingerprintService.insert(fingerprint.id, fingerprint);
                    }
                });
            } else {
                // Perform reverse fingerprinting
                dataObject.relativeLocations.forEach(relativeLocation => {
                    if (relativeLocation instanceof RelativeDistanceLocation) {
    
                    }
                });
            }
        });
    }

}

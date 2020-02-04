import { DataFrame, DataObject, RelativeDistanceLocation } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";

/**
 * Fingerprinting processing node
 */
export class FingerprintingProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    constructor(filter?: Array<new() => any>) {
        super(filter);
    }

    private _onBuild(): void {
        
    }

    public processObject(dataObject: DataObject): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            if (dataObject.absoluteLocation !== undefined) {
                // Perform fingerprint calibration
                dataObject.relativeLocations.forEach(relativeLocation => {
                    if (relativeLocation instanceof RelativeDistanceLocation) {
                        
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

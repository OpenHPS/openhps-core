import { DataFrame, DataObject, RelativeDistanceLocation, Fingerprint } from "../../../data";
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { Model } from "../../../Model";
import { DataObjectService } from "../../../service";
import * as math from 'mathjs';

/**
 * KNN Fingerprinting processing node
 */
export class KNNFingerprintingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    private _k: number = 5;

    constructor(k: number = 5, filter?: Array<new() => any>) {
        super(filter);
        this._k = k;
    }
    
    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            // Fingerprinting service
            const fingerprintService = (this.graph as Model<any, any>).findDataService(Fingerprint) as DataObjectService<Fingerprint>;
            
            if (dataObject.relativeLocations.length !== 0) {
                // Perform reverse fingerprinting
                fingerprintService.findAll().then(fingerprints => {
                    const fingerprintMap = new Map<Fingerprint, number>();
                    fingerprints.forEach(fingerprint => {
                        let ed = 0;
                        for (let i = 0 ; i < dataObject.relativeLocations.length ; i++) {
                            const relativeLocation = dataObject.relativeLocations[i];
                            if (relativeLocation instanceof RelativeDistanceLocation) {
                                ed += Math.pow(relativeLocation.distance - (fingerprint.relativeLocations[i] as RelativeDistanceLocation).distance, 2);
                            }
                        }
                        ed = Math.sqrt(ed);
                        if (ed === 0) {
                            ed = 0.001;
                        }
                        fingerprintMap.set(fingerprint, 1. / ed);
                    });

                    // Sort fingerprint map by value
                    fingerprintMap[Symbol.iterator] = function* () {
                        yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
                    };

                    const sortedFingerprints = Array.from(fingerprintMap.keys());
                    if (sortedFingerprints.length === 0) {
                        return resolve(dataObject);
                    }

                    let point = [0, 0, 0];
                    for (let k = 0 ; k < (sortedFingerprints.length < this._k ? sortedFingerprints.length : this._k) ; k++) {
                        point = math.add(point, sortedFingerprints[k].currentLocation.point) as number[];
                    }
                    const predictedLocation = sortedFingerprints[0].currentLocation;
                    predictedLocation.point = math.multiply(point, 1 / this._k);
                    dataObject.addPredictedLocation(predictedLocation);
                    resolve(dataObject);
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                resolve(dataObject);
            }
        });
    }

}

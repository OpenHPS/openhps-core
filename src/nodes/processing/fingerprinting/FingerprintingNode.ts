import { Fingerprint, DataFrame, DataObject } from '../../../data';
import { ObjectProcessingNode } from '../../ObjectProcessingNode';
import { Model } from '../../../Model';
import { DataObjectService } from '../../../service';

/**
 * Fingerprinting processing node
 */
export class FingerprintingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            if (dataObject.position !== undefined) {
                this.offlineFingerprinting(dataObject, dataFrame).then(resolve).catch(reject);
            } else {
                resolve(dataObject);
            }
        });
    }

    protected offlineFingerprinting(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            // Fingerprinting service
            const fingerprintService = (this.graph as Model<any, any>).findDataService(
                Fingerprint,
            ) as DataObjectService<Fingerprint>;

            // Perform fingerprint calibration
            const fingerprint = new Fingerprint();
            fingerprint.createdTimestamp = dataFrame.createdTimestamp;
            fingerprint.position = dataObject.position;

            dataObject.relativePositions.forEach((relativePosition) => {
                // Do not add fingerprint if reference value is unusable
                if (relativePosition.referenceValue !== undefined && !isNaN(relativePosition.referenceValue)) {
                    fingerprint.addRelativePosition(relativePosition);
                }
            });

            fingerprintService
                .insert(fingerprint.uid, fingerprint)
                .then(() => {
                    resolve(dataObject);
                })
                .catch(reject);
        });
    }
}

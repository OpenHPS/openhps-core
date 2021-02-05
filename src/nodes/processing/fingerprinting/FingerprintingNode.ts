import { Fingerprint, DataFrame, DataObject } from '../../../data';
import { ObjectProcessingNode } from '../../ObjectProcessingNode';
import { DataObjectService, FingerprintingOptions } from '../../../service';

/**
 * Fingerprinting processing node
 *
 * @category Processing node
 */
export class FingerprintingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    protected options: FingerprintingOptions;

    constructor(options?: FingerprintingOptions) {
        super(options);
    }

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
            const fingerprintService = this.model.findDataService(Fingerprint) as DataObjectService<Fingerprint>;

            // Create a fingerprint at the current position
            const fingerprint = new Fingerprint();
            fingerprint.createdTimestamp = dataFrame.createdTimestamp;
            fingerprint.position = dataObject.position;

            // Add relative positions that will define the fingerprint
            dataObject.relativePositions
                .filter((pos) =>
                    this.options.referenceType ? pos.referenceObjectType === this.options.referenceType.name : true,
                )
                .forEach((relativePosition) => {
                    // Do not add relative position if reference value is unusable
                    if (relativePosition.referenceValue !== undefined && !isNaN(relativePosition.referenceValue)) {
                        fingerprint.addRelativePosition(relativePosition);
                    }
                });

            if (fingerprint.relativePositions.length > 0) {
                // Store the fingerprint
                fingerprintService
                    .insert(fingerprint.uid, fingerprint)
                    .then(() => {
                        resolve(dataObject);
                    })
                    .catch(reject);
            } else {
                resolve(dataObject);
            }
        });
    }
}

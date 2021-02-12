import { Fingerprint, DataFrame, DataObject, RelativePosition } from '../../../data';
import { ObjectProcessingNode, ObjectProcessingNodeOptions } from '../../ObjectProcessingNode';
import { FingerprintService } from '../../../service/FingerprintService';

/**
 * Fingerprinting processing node. Stores and computes fingerprints.
 *
 * @category Processing node
 */
export abstract class FingerprintingNode<
    InOut extends DataFrame,
    F extends Fingerprint = Fingerprint
> extends ObjectProcessingNode<InOut> {
    protected options: FingerprintingOptions;
    protected service: FingerprintService<F>;

    constructor(options?: FingerprintingOptions) {
        super(options);
        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): void {
        if (this.options.classifier && this.options.classifier.length > 0) {
            this.service = this.model.findDataService(this.options.classifier);
            if (!this.service || !(this.service instanceof FingerprintService)) {
                throw new Error(
                    `Fingerprinting node requires a fingerprint data service with classifier '${this.options.classifier}'!`,
                );
            }
        } else {
            this.service = this.model.findDataService(Fingerprint);
            if (!this.service || !(this.service instanceof FingerprintService)) {
                throw new Error('Fingerprinting node requires a fingerprint data service!');
            }
        }
        // Set options
        this.service.options = this.options;
        this.service.on('update', () => this.emit('update'));
    }

    public get serviceOptions(): FingerprintingOptions {
        return this.service.options;
    }

    public get cache(): Fingerprint[] {
        return this.service.cache;
    }

    public get cachedReferences(): Set<string> {
        return this.service.cachedReferences;
    }

    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            if (dataObject.position !== undefined) {
                this.offlineFingerprinting(dataObject, dataFrame).then(resolve).catch(reject);
            } else if (dataObject.relativePositions.length !== 0) {
                this.onlineFingerprinting(dataObject, dataFrame).then(resolve).catch(reject);
            } else {
                resolve(dataObject);
            }
        });
    }

    /**
     * Online fingerprinting
     *  Use relative positions to retrieve a position.
     *
     * @param {DataObject} dataObject Data object to reverse fingerprint
     * @param {DataFrame} dataFrame Data frame this data object was included in
     */
    protected abstract onlineFingerprinting(dataObject: DataObject, dataFrame: InOut): Promise<DataObject>;

    /**
     * Offline fingerprinting
     *  Store the fingerprint if it has a position and relative positions.
     *
     * @param {DataObject} dataObject Data object to treat as fingerprinting source
     * @param {DataFrame} dataFrame Data frame this data object was included in
     * @returns {Promise<DataObject>} Data object promise
     */
    protected offlineFingerprinting(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            // Create a fingerprint at the current position
            const fingerprint = new Fingerprint();
            fingerprint.source = dataObject;
            fingerprint.createdTimestamp = dataFrame.createdTimestamp;
            fingerprint.position = dataObject.position;
            fingerprint.classifier = this.serviceOptions.classifier;

            // Add relative positions that will define the fingerprint
            dataObject.relativePositions.filter(this.serviceOptions.valueFilter).forEach((relativePosition) => {
                // Do not add relative position if reference value is unusable
                if (relativePosition.referenceValue !== undefined && !isNaN(relativePosition.referenceValue)) {
                    fingerprint.addRelativePosition(relativePosition);
                }
            });

            if (fingerprint.relativePositions.length > 0) {
                // Store the fingerprint
                this.service
                    .insertObject(fingerprint as any)
                    .then(() => {
                        resolve(dataObject);
                    })
                    .catch(reject);
            } else {
                resolve(dataObject);
            }
        });
    }

    public on(name: string | symbol, listener: (...args: any[]) => void): this;
    /**
    /**
     * Event when fingerprints are being updated
     *
     * @param {string} event update
     * @param {Function} listener Event callback
     * @returns {FingerprintingNode} Instance of node
     */
    public on(event: 'update', listener: () => Promise<void> | void): this {
        return super.on(event, listener);
    }
}

export interface FingerprintingOptions extends ObjectProcessingNodeOptions {
    /**
     * Default value of missing fingerprint values
     */
    defaultValue?: number;
    /**
     * Relative position type
     *
     * @default RelativeValue
     */
    defaultType?: new () => RelativePosition;
    /**
     * Fingerprint classifier
     *
     * @default ""
     */
    classifier?: string;
    /**
     * Filter on relative positions
     */
    valueFilter?: (pos: RelativePosition) => boolean;
    /**
     * Auto update the fingerprints for each newly recorded
     * fingerprint.
     *
     * Enabling this can cause performance issues
     *
     * @default false
     */
    autoUpdate?: boolean;
}

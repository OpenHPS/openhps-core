import { Fingerprint, DataFrame, DataObject, RelativePosition, AbsolutePosition } from '../../../data';
import { ObjectProcessingNode, ObjectProcessingNodeOptions } from '../../ObjectProcessingNode';
import { DataObjectService } from '../../../service';

/**
 * Fingerprinting processing node. Stores and computes fingerprints.
 *
 * @category Processing node
 */
export abstract class FingerprintingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    protected options: FingerprintingOptions;
    public cache: CachedFingerprint[] = [];

    private _dataService: DataObjectService<Fingerprint>;
    public cachedReferences: Set<string> = new Set();

    constructor(options?: FingerprintingOptions) {
        super(options);
        this.options.fingerprintFilter = this.options.fingerprintFilter || (() => true);
        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): Promise<void> {
        // Retrieve the data service used for fingerprints
        this.dataService = this.model.findDataService(Fingerprint);
        if (this.dataService.isReady()) {
            // Initialize previously stored fingerprints
            return this.updateFingerprints();
        } else {
            return new Promise((resolve, reject) => {
                this.dataService.once('ready', () => {
                    // Initialize previously stored fingerprints
                    this.updateFingerprints()
                        .then(() => {
                            resolve();
                        })
                        .catch(reject);
                });
            });
        }
    }

    /**
     * Data object service responsible for storing fingerprints
     *
     * @returns {DataObjectService<Fingerprint>} Data object service for fingerprints
     */
    public get dataService(): DataObjectService<Fingerprint> {
        return this._dataService;
    }

    public set dataService(dataService: DataObjectService<Fingerprint>) {
        this._dataService = dataService;
        // Bind to data service if auto update is on
        if (this.options.autoUpdate) {
            this._dataService.on('insert', this.updateFingerprints.bind(this));
            this._dataService.on('delete', this.updateFingerprints.bind(this));
            this._dataService.on('deleteAll', this.updateFingerprints.bind(this));
        }
    }

    /**
     * Trigger an update of all fingerprints
     *
     * @returns {Promise<void>} Promise of update
     */
    public abstract updateFingerprints(): Promise<void>;

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
            // Fingerprinting service
            const fingerprintService = this.model.findDataService(Fingerprint) as DataObjectService<Fingerprint>;

            // Create a fingerprint at the current position
            const fingerprint = new Fingerprint(this.name);
            fingerprint.createdTimestamp = dataFrame.createdTimestamp;
            fingerprint.position = dataObject.position;

            // Add relative positions that will define the fingerprint
            dataObject.relativePositions.filter(this.options.fingerprintFilter).forEach((relativePosition) => {
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

export interface FingerprintingOptions extends ObjectProcessingNodeOptions {
    defaultValue?: number;
    /**
     * Relative position type
     *
     * @default RelativeDistancePosition
     */
    type?: new () => RelativePosition;
    fingerprintFilter?: (pos: RelativePosition) => boolean;
    /**
     * Auto update newly added fingerprints
     *
     * @default false
     */
    autoUpdate?: boolean;
}

export class CachedFingerprint {
    public uid: string;
    public vector: number[] = [];
    public position: AbsolutePosition;
    public additionalData: any;

    constructor(fingerprint: Fingerprint) {
        this.uid = fingerprint.uid;
        this.position = fingerprint.position.clone();
        fingerprint.relativePositions
            // Sort alphabetically
            .sort((a: RelativePosition, b: RelativePosition) =>
                a.referenceObjectUID.localeCompare(b.referenceObjectUID),
            )
            .forEach((relativePosition) => {
                this.vector.push(relativePosition.referenceValue);
            });
    }
}

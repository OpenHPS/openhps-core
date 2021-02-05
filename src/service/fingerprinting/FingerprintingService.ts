import { Fingerprint, RelativePosition, AbsolutePosition, DataObject } from '../../data';
import { DataObjectService } from '../DataObjectService';
import { Service } from '../Service';
import { ObjectProcessingNodeOptions } from '../../nodes';

/**
 * Fingerprinting service
 *
 * ## Usage
 * The fingerprinting service is responsible for storage and pre-processing
 * of fingerprints.
 */
export abstract class FingerprintingService extends Service {
    public options: FingerprintingOptions;
    public cache: CachedFingerprint[] = [];

    private _dataService: DataObjectService<Fingerprint>;
    public cachedReferences: Set<string> = new Set();

    constructor() {
        super();

        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): Promise<void> {
        if (this.dataService !== undefined) {
            if (this.dataService.isReady()) {
                return this.updateFingerprints();
            } else {
                return new Promise((resolve, reject) => {
                    this.dataService.once('ready', () => {
                        this.updateFingerprints()
                            .then(() => {
                                resolve();
                            })
                            .catch(reject);
                    });
                });
            }
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
        this._dataService.on('insert', this.updateFingerprints.bind(this));
        this._dataService.on('delete', this.updateFingerprints.bind(this));
        this._dataService.on('deleteAll', this.updateFingerprints.bind(this));
    }

    /**
     * Trigger an update of all fingerprints
     *
     * @returns {Promise<void>} Promise of update
     */
    public abstract updateFingerprints(): Promise<void>;
}

export interface FingerprintingOptions extends ObjectProcessingNodeOptions {
    defaultValue?: number;
    /**
     * Relative position type
     *
     * @default RelativeDistancePosition
     */
    type?: new () => RelativePosition;
    /**
     * Relative reference type
     *
     * @default DataObject
     */
    referenceType?: new () => DataObject;
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

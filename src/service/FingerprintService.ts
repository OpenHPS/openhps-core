import { Fingerprint, RelativeValue } from '../data';
import { FingerprintingOptions } from '../nodes';
import { DataObjectService } from './DataObjectService';
import { DataServiceDriver } from './DataServiceDriver';

/**
 * A fingerprint service handles the preprocessing and storage of fingerprints.
 */
export class FingerprintService<T extends Fingerprint = Fingerprint> extends DataObjectService<T> {
    public cache: Fingerprint[] = [];
    public cachedReferences: Set<string> = new Set();
    private _options: FingerprintingOptions;

    constructor(dataServiceDriver: DataServiceDriver<string, T>, options?: FingerprintingOptions) {
        super(dataServiceDriver);
        this.options = options || {};
        this.name = this.options.classifier.length > 0 ? this.options.classifier : this.name;
        this.once('ready', this.update.bind(this));
    }

    public set options(options: FingerprintingOptions) {
        this._options = options || this.options;
        // Default options
        this.options.valueFilter = this.options.valueFilter || (() => true);
        this.options.classifier = this.options.classifier || '';
        this.options.defaultValue = this.options.defaultValue || 0;
        this.options.defaultType = this.options.defaultType || RelativeValue;
    }

    public get options(): FingerprintingOptions {
        return this._options;
    }

    public insert(id: string, object: T): Promise<T> {
        return new Promise((resolve, reject) => {
            super
                .insert(id, object)
                .then((storedObject) => {
                    if (!this.options.autoUpdate) {
                        return resolve(storedObject);
                    }
                    return [storedObject, this.update()];
                })
                .then((result: [T, any]) => {
                    resolve(result[0]);
                })
                .catch(reject);
        });
    }

    /**
     * Trigger an update of all fingerprints
     *
     * @returns {Promise<void>} Promise of update
     */
    public update(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Load all fingerprints from the data service
            // We do not filter as we expect a separate service per classifier
            this.findAll()
                .then((fingerprints) => {
                    const mergedFingerprints = new Map<string, Fingerprint>();

                    fingerprints.forEach((fingerprint) => {
                        /* Add missing reference positions (objects not in range) */
                        fingerprint.relativePositions.forEach((relativePosition) => {
                            if (!this.cachedReferences.has(relativePosition.referenceObjectUID))
                                this.cachedReferences.add(relativePosition.referenceObjectUID);
                        });

                        /* Merge fingerprint value */
                        const point = fingerprint.position.toVector3();
                        const serializedPoint = JSON.stringify(point);
                        if (mergedFingerprints.has(serializedPoint)) {
                            const existingFingerprint = mergedFingerprints.get(serializedPoint);
                            existingFingerprint.relativePositions.forEach((relativePosition) => {
                                const existingRelativeLocations = fingerprint.getRelativePositions(
                                    relativePosition.referenceObjectUID,
                                );
                                if (existingRelativeLocations.length !== 0) {
                                    existingRelativeLocations[0].referenceValue += relativePosition.referenceValue;
                                    existingRelativeLocations[0].referenceValue /= 2;
                                }
                            });

                            fingerprint.relativePositions.forEach((relativePosition) => {
                                if (!existingFingerprint.getRelativePosition(relativePosition.referenceObjectUID)) {
                                    existingFingerprint.addRelativePosition(relativePosition);
                                }
                            });
                            mergedFingerprints.set(serializedPoint, existingFingerprint);
                        } else {
                            mergedFingerprints.set(serializedPoint, fingerprint);
                        }
                    });
                    const filteredFingerprints = Array.from(mergedFingerprints.values());

                    /* Cache fingerprints to simple vectors */
                    this.cacheFingerprints(filteredFingerprints);
                    this.emit('update');
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Cache filtered fingerprints
     *
     * @param {Fingerprint[]} fingerprints Filtered fingerprints
     */
    protected cacheFingerprints(fingerprints: Fingerprint[]): void {
        if (fingerprints.length > 0) {
            this.cache = [];
            fingerprints.forEach((fingerprint) => {
                // Complete missing references
                this.cachedReferences.forEach((relativeObject) => {
                    if (!fingerprint.hasRelativePosition(relativeObject)) {
                        const relativePosition = new this.options.defaultType();
                        relativePosition.referenceObjectUID = relativeObject;
                        relativePosition.referenceValue = this.options.defaultValue;
                        fingerprint.addRelativePosition(relativePosition);
                    }
                });
                fingerprint.computeVector();
                this.cache.push(fingerprint);
            });
        }
    }
}

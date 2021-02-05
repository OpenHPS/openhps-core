import { FingerprintingService, CachedFingerprint, FingerprintingOptions } from './FingerprintingService';
import { Fingerprint } from '../../data';

/**
 * K-Neirest Neigbours fingerprinting service
 *
 * ## Usage
 * The KNN fingeprinting service is responsible for storing, merging,
 * interpolation of fingerprints.
 */
export class KNNFingerprintingService extends FingerprintingService {
    public options: KNNFingerprintingOptions;

    public updateFingerprints(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Load all fingerprints from the data service
            this.dataService
                .findAll()
                .then((fingerprints) => {
                    const mergedFingerprints = new Map<string, Fingerprint>();
                    const elevations = new Map<number, [Array<number>, Array<number>]>();

                    fingerprints.forEach((fingerprint) => {
                        /* Add missing reference positions (objects not in range) */
                        fingerprint.relativePositions.forEach((relativePosition) => {
                            if (!this.cachedReferences.has(relativePosition.referenceObjectUID))
                                this.cachedReferences.add(relativePosition.referenceObjectUID);
                        });

                        /* Merge fingerprint value */
                        const point = fingerprint.position.toVector3();
                        const serializedPoint = JSON.stringify(fingerprint.position.toVector3());
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

                        // Store X,Y points per elevation
                        if (this.options.interpolate) {
                            const elevation = point.z;
                            let points: [Array<number>, Array<number>];
                            if (elevations.has(elevation)) {
                                points = elevations.get(elevation);
                            } else {
                                points = [[], []];
                                elevations.set(elevation, points);
                            }
                            points[0].push(point.x);
                            points[1].push(point.y);
                        }
                    });
                    const filteredFingerprints = Array.from(mergedFingerprints.values());

                    /* Cache fingerprints to simple vectors */
                    this._cacheFingerprints(filteredFingerprints);

                    this.emit('refresh');
                    resolve();
                })
                .catch(reject);
        });
    }

    private _cacheFingerprints(filteredFingerprints: Fingerprint[]): void {
        filteredFingerprints.forEach((fingerprint) => {
            // Complete missing references
            this.cachedReferences.forEach((relativeObject) => {
                if (!fingerprint.hasRelativePosition(relativeObject)) {
                    const relativePosition = new this.options.type();
                    relativePosition.referenceObjectUID = relativeObject;
                    relativePosition.referenceValue = this.options.defaultValue;
                    fingerprint.addRelativePosition(relativePosition);
                }
            });
            this.cache.push(new CachedFingerprint(fingerprint));
        });
    }
}

export interface KNNFingerprintingOptions extends FingerprintingOptions {
    k: number;
    /**
     * Use weighted KNN
     */
    weighted?: boolean;
    /**
     * Naive algorithm (no KD-tree)
     */
    naive?: boolean;
    interpolate?: boolean;
}

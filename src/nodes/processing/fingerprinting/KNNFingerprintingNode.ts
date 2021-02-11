import { CachedFingerprint, FingerprintingNode, FingerprintingOptions } from './FingerprintingNode';
import {
    Fingerprint,
    DataFrame,
    DataObject,
    RelativePosition,
    AbsolutePosition,
    RelativeDistancePosition,
} from '../../../data';
import { Vector3 } from '../../../utils';
import { BinaryHeap } from '../../../utils/_internal/BinaryHeap';
import { DistanceFunction } from '../../../utils/algorithms/DistanceFunction';
import { KNNWeightFunction } from './KNNWeightFunction';

/**
 * KNN Fingerprinting processing node
 *
 * @category Processing node
 */
export class KNNFingerprintingNode<InOut extends DataFrame> extends FingerprintingNode<InOut> {
    protected options: KNNFingerprintingOptions;
    protected kdtree: KDTree;

    constructor(options: KNNFingerprintingOptions) {
        super(options);

        // Default options
        this.options.defaultValue = this.options.defaultValue ? this.options.defaultValue : 0;
        this.options.type = RelativeDistancePosition;
        this.options.k = this.options.k || 1;
        this.options.similarityFunction = this.options.similarityFunction || DistanceFunction.EUCLIDEAN;
        this.options.weightFunction = this.options.weightFunction || KNNWeightFunction.DEFAULT;
    }

    protected onlineFingerprinting(dataObject: DataObject): Promise<DataObject> {
        return new Promise((resolve) => {
            // Make sure the object has a relative position to all reference objects
            // used for the fingerprinting
            this.cachedReferences.forEach((relativeObject) => {
                if (!dataObject.hasRelativePosition(relativeObject)) {
                    const relativePosition = new this.options.type();
                    relativePosition.referenceObjectUID = relativeObject;
                    relativePosition.referenceValue = this.options.defaultValue;
                    dataObject.addRelativePosition(relativePosition);
                }
            });

            const dataObjectPoint: number[] = [];
            dataObject.relativePositions
                // Filter out unneeded relative positions
                .filter((relativePosition) => this.cachedReferences.has(relativePosition.referenceObjectUID))
                // Sort alphabetically
                .sort((a: RelativePosition, b: RelativePosition) =>
                    a.referenceObjectUID.localeCompare(b.referenceObjectUID),
                )
                .forEach((relativePosition) => {
                    dataObjectPoint.push(relativePosition.referenceValue);
                });

            // Perform reverse fingerprinting
            let results = new Array<[AbsolutePosition, number]>();
            if (this.options.naive) {
                this.cache.forEach((cachedFingerprint) => {
                    let distance = this.options.similarityFunction(dataObjectPoint, cachedFingerprint.vector);
                    if (distance === 0) {
                        distance = 0.001;
                    }
                    results.push([cachedFingerprint.position, distance]);
                });
                results = results
                    // Sort by euclidean distance
                    .sort((a, b) => a[1] - b[1])
                    // Only the first K neighbours
                    .splice(0, this.options.k);
            } else {
                results = this.kdtree.nearest(dataObjectPoint, this.options.k);
            }

            const point: Vector3 = new Vector3(0, 0, 0);
            if (this.options.weighted) {
                let scale = 0;
                results.forEach((sortedFingerprint) => {
                    const weight = this.options.weightFunction(sortedFingerprint[1]);
                    scale += this.options.weightFunction(sortedFingerprint[1]);
                    point.add(sortedFingerprint[0].toVector3().multiplyScalar(weight));
                });
                point.divideScalar(scale);
            } else {
                results.forEach((sortedFingerprint) => {
                    point.add(sortedFingerprint[0].toVector3());
                });
                point.multiplyScalar(1 / this.options.k);
            }

            // Set a new position
            const newPosition = results[0][0].clone();
            newPosition.fromVector(point);
            dataObject.setPosition(newPosition);
            resolve(dataObject);
        });
    }

    public updateFingerprints(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Load all fingerprints from the data service
            this.dataService
                .findAll({
                    classifier: this.name,
                })
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

                    /* Create k-d tree */
                    if (!this.options.naive) {
                        this.kdtree = new KDTree(this.cache, 0, this.options.similarityFunction);
                    }
                    resolve();
                })
                .catch(reject);
        });
    }

    private _cacheFingerprints(filteredFingerprints: Fingerprint[]): void {
        if (filteredFingerprints.length > 0) {
            this.cache = [];
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
}

class KDTree {
    public axis: number;
    public fingerprint: CachedFingerprint;
    public left: KDTree;
    public right: KDTree;
    private _distanceFn: (pointA: number[], pointB: number[]) => number;

    constructor(
        fingerprints: CachedFingerprint[],
        depth = 0,
        distanceFn: (pointA: number[], pointB: number[]) => number,
    ) {
        this._distanceFn = distanceFn;
        // No fingerprints in cache
        if (fingerprints.length === 0) {
            return;
        }

        const dimensions = fingerprints[0].vector.length;
        this.axis = depth % dimensions;
        fingerprints.sort((a, b) => a.vector[this.axis] - b.vector[this.axis]);

        const medianIndex = Math.floor(fingerprints.length / 2);

        this.fingerprint = fingerprints[medianIndex];

        const leftFingerprints = fingerprints.slice(0, medianIndex);
        if (leftFingerprints.length) {
            this.left = new KDTree(leftFingerprints, depth + 1, this._distanceFn);
        }

        const rightFingerprints = fingerprints.slice(medianIndex + 1);
        if (rightFingerprints.length) {
            this.right = new KDTree(rightFingerprints, depth + 1, this._distanceFn);
        }
    }

    private _nearestSearch(point: number[], bestNodes: BinaryHeap<[KDTree, number]>, count: number, node: KDTree) {
        const ownDistance = this._distanceFn(point, node.fingerprint.vector);
        const vector = [...node.fingerprint.vector];

        vector[this.axis] = point[this.axis];

        if (node.right === undefined && node.left === undefined) {
            if (bestNodes.size() < count || ownDistance < bestNodes.peek()[1]) {
                bestNodes.push([node, ownDistance]);
                if (bestNodes.size() > count) {
                    bestNodes.pop();
                }
            }
            return;
        }

        const [subtree, otherSubtree] =
            point[this.axis] < node.fingerprint.vector[this.axis] ? [node.left, node.right] : [node.right, node.left];

        if (subtree) {
            this._nearestSearch(point, bestNodes, count, subtree);
        }

        if (bestNodes.size() < count || ownDistance < bestNodes.peek()[1]) {
            bestNodes.push([node, ownDistance]);
            if (bestNodes.size() > count) {
                bestNodes.pop();
            }
        }

        if (bestNodes.size() < count || this._distanceFn(vector, node.fingerprint.vector) < bestNodes.peek()[1]) {
            if (otherSubtree !== undefined) {
                this._nearestSearch(point, bestNodes, count, otherSubtree);
            }
        }
    }

    public nearest(point: number[], count = 1, maxDistance?: number): Array<[AbsolutePosition, number]> {
        const bestNodes = new BinaryHeap<[KDTree, number]>((element: [KDTree, number]) => {
            return -element[1];
        });

        if (maxDistance) {
            for (let i = 0; i < count; i++) {
                bestNodes.push([null, maxDistance]);
            }
        }

        this._nearestSearch(point, bestNodes, count, this);

        const result: Array<[AbsolutePosition, number]> = [];

        for (let i = 0; i < Math.min(count, bestNodes.content.length); i += 1) {
            if (bestNodes.content[i][0]) {
                result.push([bestNodes.content[i][0].fingerprint.position, bestNodes.content[i][1]]);
            }
        }
        return result;
    }

    public get balanceFactor(): number {
        /**
         * Get the height of the tree node
         *
         * @param {KDTree} node KD tree node
         * @returns {number} Height of the tree
         */
        function height(node: KDTree): number {
            if (node === undefined) {
                return 0;
            }
            return Math.max(height(node.left), height(node.right)) + 1;
        }

        /**
         * Count the nodes in the tree
         *
         * @param {KDTree} node KD tree node
         * @returns {number} number of nodes in the tree
         */
        function count(node: KDTree): number {
            if (node === undefined) {
                return 0;
            }
            return count(node.left) + count(node.right) + 1;
        }

        return height(this) / (Math.log(count(this)) / Math.log(2));
    }
}

export interface KNNFingerprintingOptions extends FingerprintingOptions {
    k?: number;
    /**
     * Use weighted KNN
     */
    weighted?: boolean;
    /**
     * Naive algorithm (no KD-tree)
     */
    naive?: boolean;
    interpolate?: boolean;
    /**
     * Similarity function (distance function)
     *
     * @default DistanceFunction.EUCLIDEAN
     */
    similarityFunction?: (point: number[], fingerprint: number[]) => number;
    /**
     * Weight function
     *
     * @default KNNWeightFunction.DEFAULT
     */
    weightFunction?: (distance: number) => number;
}

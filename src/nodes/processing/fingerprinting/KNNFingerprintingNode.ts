import { FingerprintingNode } from './FingerprintingNode';
import {
    Fingerprint,
    DataFrame,
    DataObject,
    RelativePosition,
    AbsolutePosition,
    RelativeDistancePosition,
} from '../../../data';
import { CachedFingerprint, KNNFingerprintingService, KNNFingerprintingOptions } from '../../../service';
import { ModelBuilder } from '../../../ModelBuilder';
import { Model } from '../../../Model';
import { Vector3 } from '../../../utils';

/**
 * KNN Fingerprinting processing node
 */
export class KNNFingerprintingNode<InOut extends DataFrame> extends FingerprintingNode<InOut> {
    protected options: KNNFingerprintingOptions;

    private _service: KNNFingerprintingService;
    private _kdtree: KDTree;
    private _cacheObjects: Set<string> = new Set();
    protected cache: CachedFingerprint[] = [];

    constructor(options: KNNFingerprintingOptions) {
        super(options);

        // Default options
        this.options.defaultValue = this.options.defaultValue ? this.options.defaultValue : 0;
        this.options.type = RelativeDistancePosition;

        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(modelBuilder: ModelBuilder<any, any>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const model = this.graph as Model<any, any>;
            this._service = model.findService(KNNFingerprintingService);
            if (this._service === null) {
                modelBuilder.addService(new KNNFingerprintingService());
                this._service = model.findService(KNNFingerprintingService);
            }
            this._service.dataService = model.findDataService(Fingerprint);
            this._service.options = this.options;

            if (!this._service.isReady()) {
                this._service
                    .emitAsync('build')
                    .then(() => {
                        this._updateCache();
                        resolve();
                    })
                    .catch(reject);
            } else {
                this._updateCache();
                resolve();
            }

            this._service.on('refresh', this._updateCache.bind(this));
        });
    }

    private _updateCache(): void {
        this.cache = this._service.cache;
        this._cacheObjects = this._service.cachedReferences;

        /* Create k-d tree */
        if (!this.options.naive) {
            this._kdtree = new KDTree(this.cache);
        }
    }

    protected get kdtree(): KDTree {
        return this._kdtree;
    }

    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            if (dataObject.position !== undefined) {
                // Perform the fingerprinting offline stage
                super.offlineFingerprinting(dataObject, dataFrame).then(resolve).catch(reject);
            } else if (dataObject.relativePositions.length !== 0) {
                this.onlineFingerprinting(dataObject).then(resolve).catch(reject);
            } else {
                resolve(dataObject);
            }
        });
    }

    protected onlineFingerprinting(dataObject: DataObject): Promise<DataObject> {
        return new Promise((resolve) => {
            // Make sure the object has a relative position to all reference objects
            // used for the fingerprinting
            this._cacheObjects.forEach((relativeObject) => {
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
                .filter((relativePosition) => this._cacheObjects.has(relativePosition.referenceObjectUID))
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
                    let ed = 0; // Euclidean distance
                    for (let i = 0; i < dataObjectPoint.length; i++) {
                        ed += Math.pow(dataObjectPoint[i] - cachedFingerprint.vector[i], 2);
                    }
                    ed = Math.sqrt(ed);
                    if (ed === 0) {
                        ed = 0.001;
                    }
                    results.push([cachedFingerprint.position, ed]);
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
                    scale += 1 / sortedFingerprint[1];
                });
                results.forEach((sortedFingerprint) => {
                    const weight = 1 / sortedFingerprint[1] / scale;
                    point.add(sortedFingerprint[0].toVector3().multiplyScalar(weight));
                });
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
}

class KDTree {
    public axis: number;
    public fingerprint: CachedFingerprint;
    public left: KDTree;
    public right: KDTree;

    constructor(fingerprints: CachedFingerprint[], depth = 0) {
        const dimensions = fingerprints[0].vector.length;
        this.axis = depth % dimensions;
        fingerprints.sort((a, b) => a.vector[this.axis] - b.vector[this.axis]);

        const medianIndex = Math.floor(fingerprints.length / 2);

        this.fingerprint = fingerprints[medianIndex];

        const leftFingerprints = fingerprints.slice(0, medianIndex);
        if (leftFingerprints.length) {
            this.left = new KDTree(leftFingerprints, depth + 1);
        }

        const rightFingerprints = fingerprints.slice(medianIndex + 1);
        if (rightFingerprints.length) {
            this.right = new KDTree(rightFingerprints, depth + 1);
        }
    }

    /**
     * Euclidean distance function
     *
     * @param {number[]} fingerprint Fingerprint position
     * @param {number[]} point Point to get euclidean distance for
     * @returns {number} Euclidean distance
     */
    private _distance(fingerprint: number[], point: number[]): number {
        let ed = 0;
        for (let i = 0; i < point.length; i++) {
            ed += Math.pow(point[i] - fingerprint[i], 2);
        }
        ed = Math.sqrt(ed);
        if (ed === 0) {
            ed = 0.001;
        }
        return ed;
    }

    private _nearestSearch(point: number[], bestNodes: BinaryHeap<[KDTree, number]>, count: number, node: KDTree) {
        const ownDistance = this._distance(node.fingerprint.vector, point);
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

        if (bestNodes.size() < count || this._distance(vector, node.fingerprint.vector) < bestNodes.peek()[1]) {
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

/**
 * Binary Heap Implementation
 *
 * @see {@link http://eloquentjavascript.net/appendix2.html}
 */
class BinaryHeap<T> {
    public _content: T[] = [];
    private _scoreFn: (element: T) => number;

    constructor(scoreFn: (element: T) => number) {
        this._scoreFn = scoreFn;
    }

    public get content(): T[] {
        return this._content;
    }

    public push(element: T): void {
        // Add the new element to the end of the array.
        this._content.push(element);
        // Allow it to bubble up.
        this.bubbleUp(this._content.length - 1);
    }

    public pop(): T {
        // Store the first element so we can return it later.
        const result = this._content[0];
        // Get the element at the end of the array.
        const end = this._content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it sink down.
        if (this._content.length > 0) {
            this._content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }

    public remove(node: T): void {
        const length = this._content.length;
        // To remove a value, we must search through the array to find
        // it.
        for (let i = 0; i < length; i++) {
            if (this._content[i] !== node) continue;
            // When it is found, the process seen in 'pop' is repeated
            // to fill up the hole.
            const end = this._content.pop();
            // If the element we popped was the one we needed to remove,
            // we're done.
            if (i === length - 1) break;
            // Otherwise, we replace the removed element with the popped
            // one, and allow it to float up or sink down as appropriate.
            this._content[i] = end;
            this.bubbleUp(i);
            this.sinkDown(i);
            break;
        }
    }

    public size(): number {
        return this._content.length;
    }

    public bubbleUp(n: number) {
        // Fetch the element that has to be moved.
        const element = this._content[n];
        const score = this._scoreFn(element);
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            const parentN = Math.floor((n + 1) / 2) - 1;
            const parent = this._content[parentN];
            // If the parent has a lesser score, things are in order and we
            // are done.
            if (score >= this._scoreFn(parent)) break;

            // Otherwise, swap the parent with the current element and
            // continue.
            this._content[parentN] = element;
            this._content[n] = parent;
            n = parentN;
        }
    }

    public peek(): T {
        return this.content[0];
    }

    public sinkDown(n: number) {
        // Look up the target element and its score.
        const length = this._content.length;
        const element = this._content[n];
        const elemScore = this._scoreFn(element);

        // eslint-disable-next-line
        while (true) {
            // Compute the indices of the child elements.
            const child2N = (n + 1) * 2;
            const child1N = child2N - 1;
            let child1Score = null;
            // This is used to store the new position of the element,
            // if any.
            let swap = null;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                const child1 = this._content[child1N];
                child1Score = this._scoreFn(child1);
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                const child2 = this._content[child2N];
                const child2Score = this._scoreFn(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) swap = child2N;
                if (child1Score < elemScore) swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                const child2 = this._content[child2N];
                const child2Score = this._scoreFn(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) swap = child2N;
            }

            // No need to swap further, we are done.
            if (swap === null) break;

            // Otherwise, swap and continue.
            this._content[n] = this._content[swap];
            this._content[swap] = element;
            n = swap;
        }
    }
}

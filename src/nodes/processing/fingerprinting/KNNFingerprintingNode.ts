import { DataFrame, DataObject, Fingerprint, AbsoluteLocation, DataSerializer } from "../../../data";
import { Model } from "../../../Model";
import { DataObjectService } from "../../../service";
import * as math from 'mathjs';
import { FingerprintingNode } from "./FingerprintingNode";

/**
 * KNN Fingerprinting processing node
 */
export class KNNFingerprintingNode<InOut extends DataFrame> extends FingerprintingNode<InOut> {
    private _options: KNNFingerprintingOptions;
    private _cache: CachedFingerprint[] = new Array();
    private _kdtree: KDTree;

    constructor(options: KNNFingerprintingOptions, filterFn?: (object: DataObject) => boolean) {
        super(filterFn);
        this._options = options;

        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const fingerprintService = (this.graph as Model<any, any>).findDataService(Fingerprint) as DataObjectService<Fingerprint>;
            fingerprintService.findAll().then(fingerprints => {
                if (this.options.interpolate) {
                    
                }
                fingerprints.forEach(fingerprint => {
                    this._cache.push(new CachedFingerprint(fingerprint));
                });
                if (!this.options.naive) {
                    this._kdtree = new KDTree(this.cache);
                }
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    protected get cache(): CachedFingerprint[] {
        return this._cache;
    }

    protected get kdtree(): KDTree {
        return this._kdtree;
    }

    protected get options(): KNNFingerprintingOptions {
        return this._options;
    }
    
    public processObject(dataObject: DataObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            if (dataObject.currentLocation !== undefined) {
                super.processObject(dataObject, dataFrame).then(output => {
                    resolve(output);
                }).catch(ex => {
                    reject(ex);
                });
            } else if (dataObject.relativeLocations.length !== 0) {
                // Perform reverse fingerprinting
                let results = new Array<[AbsoluteLocation, number]>();
                if (this.options.naive) {
                    const dataObjectPoint: number[] = [];
                    dataObject.relativeLocations.forEach(relativeLocation => {
                        dataObjectPoint.push(relativeLocation.referenceValue);
                    });
                    this.cache.forEach(cachedFingerprint => {
                        let ed = 0;
                        for (let i = 0 ; i < dataObjectPoint.length ; i++) {
                            ed += Math.pow(dataObjectPoint[i] - cachedFingerprint.vector[i], 2);
                        }
                        ed = Math.sqrt(ed);
                        if (ed === 0) {
                            ed = 0.001;
                        }
                        results.push([cachedFingerprint.location, ed]);
                    });
                    results = results.sort((a, b) => a[1] - b[1]).splice(0, this.options.k).map((v: [any, number]) => [DataSerializer.deserialize(v[0]), v[1]]);    
                } else {
                    results = this.kdtree.nearest(dataObject, this.options.k);
                }

                let point = Array<number>(results[0][0].point.length).fill(0);
                if (this.options.weighted) {
                    let scale = 0;
                    results.forEach(sortedFingerprint => {
                        scale += 1 / sortedFingerprint[1];
                    });
                    results.forEach(sortedFingerprint => {
                        const weight = (1 / sortedFingerprint[1]) / scale;
                        point = math.add(point, math.multiply(sortedFingerprint[0].point, weight)) as number[];
                    });
                } else {
                    results.forEach(sortedFingerprint => {
                        point = math.add(point, sortedFingerprint[0].point) as number[];
                    });
                    point = math.multiply(point, 1 / this.options.k);
                }
                const predictedLocation = results[0][0];
                predictedLocation.point = point;
                dataObject.addPredictedLocation(predictedLocation);
                resolve(dataObject);
            } else {
                resolve(dataObject);
            }
        });
    }

}

export class KNNFingerprintingOptions {
    public k: number;
    public weighted?: boolean = true;
    public naive?: boolean = false;
    public interpolate?: boolean = false;
}

class KNNInterpolationOptions {

}

class CachedFingerprint {
    public vector: number[] = [];
    public location: any;

    constructor(fingerprint: Fingerprint) {
        this.location = DataSerializer.serialize(fingerprint.currentLocation);
        fingerprint.relativeLocations.forEach(relativeLocation => {
            this.vector.push(relativeLocation.referenceValue);
        });
    }
}

class KDTree {
    public axis: number;
    public fingerprint: CachedFingerprint;
    public left: KDTree;
    public right: KDTree;

    constructor(fingerprints: CachedFingerprint[], depth: number = 0) {
        const dimensions = fingerprints[0].vector.length;
        this.axis = depth % dimensions;
        fingerprints.sort((a, b) => 
            a.vector[this.axis] - b.vector[this.axis]);

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
     * @param fingerprint 
     * @param object 
     */
    private _distance(fingerprint: number[], point: number[]): number {
        let ed = 0;
        for (let i = 0 ; i < point.length ; i++) {
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

        const [subtree, otherSubtree] = point[this.axis] < node.fingerprint.vector[this.axis] ?
            [node.left, node.right] : [node.right, node.left];

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

    public nearest(object: DataObject, count: number = 1, maxDistance?: number): Array<[AbsoluteLocation, number]> {
        const bestNodes = new BinaryHeap<[KDTree, number]>((element: [KDTree, number]) => {
            return -element[1];
        });

        const point: number[] = [];
        object.relativeLocations.forEach(relativeLocation => {
            point.push(relativeLocation.referenceValue);
        });

        if (maxDistance) {
            for (let i = 0; i < count; i ++) {
              bestNodes.push([null, maxDistance]);
            }
        }
    
        this._nearestSearch(point, bestNodes, count, this);

        const result: Array<[AbsoluteLocation, number]> = [];

        for (let i = 0; i < Math.min(count, bestNodes.content.length); i += 1) {
            if (bestNodes.content[i][0]) {
                result.push([DataSerializer.deserialize(bestNodes.content[i][0].fingerprint.location), bestNodes.content[i][1]]);
            }
        }
        return result;
    }

    public get balanceFactor(): number {
        function height(node: KDTree): number {
            if (node === undefined) {
                return 0;
            }
            return Math.max(height(node.left), height(node.right)) + 1;
        }
  
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
 * @source http://eloquentjavascript.net/appendix2.html
 */
class BinaryHeap<T> {
    public _content: T[] = new Array();
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
          if (score >= this._scoreFn(parent))
            break;
    
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
            if (child1Score < elemScore)
                swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
            const child2 = this._content[child2N];
            const child2Score = this._scoreFn(child2);
            if (child2Score < (swap === null ? elemScore : child1Score))
                swap = child2N;
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

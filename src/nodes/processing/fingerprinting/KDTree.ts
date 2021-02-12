import { AbsolutePosition, Fingerprint } from '../../../data';
import { BinaryHeap } from '../../../utils/_internal/BinaryHeap';

export class KDTree {
    public axis: number;
    public fingerprint: Fingerprint;
    public left: KDTree;
    public right: KDTree;
    private _distanceFn: (pointA: number[], pointB: number[]) => number;

    constructor(fingerprints: Fingerprint[], distanceFn: (pointA: number[], pointB: number[]) => number, depth = 0) {
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
            this.left = new KDTree(leftFingerprints, this._distanceFn, depth + 1);
        }

        const rightFingerprints = fingerprints.slice(medianIndex + 1);
        if (rightFingerprints.length) {
            this.right = new KDTree(rightFingerprints, this._distanceFn, depth + 1);
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

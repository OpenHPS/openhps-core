export abstract class DistanceFunction {
    /**
     * Euclidean distance function
     *
     * @param {number[]} pointA n-dimensional point
     * @param {number[]} pointB n-dimensional point
     * @returns {number} distance
     */
    public static readonly EUCLIDEAN = (pointA: number[], pointB: number[]) => {
        let distance = 0;
        for (let i = 0; i < pointA.length; i++) {
            distance += Math.pow(pointA[i] - pointB[i], 2);
        }
        distance = Math.sqrt(distance);
        return distance;
    };
    /**
     * Manhattan distance function
     *
     * @param {number[]} pointA n-dimensional point
     * @param {number[]} pointB n-dimensional point
     * @returns {number} distance
     */
    public static readonly MANHATTAN = (pointA: number[], pointB: number[]) => {
        let distance = 0;
        for (let i = 0; i < pointA.length; i++) {
            distance += Math.abs(pointA[i] - pointB[i]);
        }
        return distance;
    };
    /**
     * Canberra distance function
     *
     * @param {number[]} pointA n-dimensional point
     * @param {number[]} pointB n-dimensional point
     * @returns {number} distance
     */
    public static readonly CANBERRA = (pointA: number[], pointB: number[]) => {
        let distance = 0;
        for (let i = 0; i < pointA.length; i++) {
            distance += Math.abs(pointA[i] - pointB[i]) / (Math.abs(pointA[i]) + Math.abs(pointB[i]));
        }
        return distance;
    };
    /**
     * Chebyshev distance function
     *
     * @param {number[]} pointA n-dimensional point
     * @param {number[]} pointB n-dimensional point
     * @returns {number} distance
     */
    public static readonly CHEBYSHEV = (pointA: number[], pointB: number[]) => {
        let maxDistance = 0;
        for (let i = 0; i < pointA.length; i++) {
            maxDistance = Math.max(maxDistance, Math.abs(pointA[i] - pointB[i]));
        }
        return maxDistance;
    };
}

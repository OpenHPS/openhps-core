import { AngleUnit, GCS } from './unit';

/**
 * Haversine formulate to calculate distance of two geographical points
 *
 * @param {number[]} pointA Point a
 * @param {number[]} pointB Point B
 * @returns {number} distance
 */
export function HAVERSINE(pointA: number[], pointB: number[]): number {
    const latRadA = AngleUnit.DEGREE.convert(pointA[1], AngleUnit.RADIAN);
    const latRadB = AngleUnit.DEGREE.convert(pointB[1], AngleUnit.RADIAN);
    const deltaLat = AngleUnit.DEGREE.convert(pointB[1] - pointA[1], AngleUnit.RADIAN);
    const deltaLon = AngleUnit.DEGREE.convert(pointB[0] - pointA[0], AngleUnit.RADIAN);
    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(latRadA) * Math.cos(latRadB) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return GCS.EARTH_RADIUS * c;
}

/**
 * Euclidean distance function
 *
 * @param {number[]} pointA n-dimensional point
 * @param {number[]} pointB n-dimensional point
 * @returns {number} distance
 */
export function EUCLIDEAN(pointA: number[], pointB: number[]): number {
    let distance = 0;
    for (let i = 0; i < pointA.length; i++) {
        distance += Math.pow(pointA[i] - pointB[i], 2);
    }
    distance = Math.sqrt(distance);
    return distance;
}

/**
 * Manhattan distance function
 *
 * @param {number[]} pointA n-dimensional point
 * @param {number[]} pointB n-dimensional point
 * @returns {number} distance
 */
export function MANHATTAN(pointA: number[], pointB: number[]): number {
    let distance = 0;
    for (let i = 0; i < pointA.length; i++) {
        distance += Math.abs(pointA[i] - pointB[i]);
    }
    return distance;
}

/**
 * Canberra distance function
 *
 * @param {number[]} pointA n-dimensional point
 * @param {number[]} pointB n-dimensional point
 * @returns {number} distance
 */
export function CANBERRA(pointA: number[], pointB: number[]): number {
    let distance = 0;
    for (let i = 0; i < pointA.length; i++) {
        distance += Math.abs(pointA[i] - pointB[i]) / (Math.abs(pointA[i]) + Math.abs(pointB[i]));
    }
    return distance;
}

/**
 * Chebyshev distance function
 *
 * @param {number[]} pointA n-dimensional point
 * @param {number[]} pointB n-dimensional point
 * @returns {number} distance
 */
export function CHEBYSHEV(pointA: number[], pointB: number[]): number {
    let maxDistance = 0;
    for (let i = 0; i < pointA.length; i++) {
        maxDistance = Math.max(maxDistance, Math.abs(pointA[i] - pointB[i]));
    }
    return maxDistance;
}

export type DistanceFn = (pointA: number[], pointB: number[]) => number;

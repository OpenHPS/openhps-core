import * as math from 'mathjs';
import { PropertyFilterNode } from "./PropertyFilterNode";
import { FilterOptions } from "./FilterNode";
import { DataObject, DataFrame } from '../../../data';

/**
 * Basic Kalman Filter processing node
 */
export class BKFilterNode<InOut extends DataFrame> extends PropertyFilterNode<InOut> {

    constructor(objectFilter: (object: DataObject, frame?: DataFrame) => boolean,
                propertySelector: (object: DataObject, frame?: InOut) => PropertyKey,
                options: KalmanFilterOptions) {
        super(objectFilter, propertySelector, options);
    }

    public initFilter<T extends number | number[]>(object: DataObject, value: T, options: KalmanFilterOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve({ x: undefined, cov: NaN, ...options });
        });
    }
    
    public filter<T extends number | number[]>(object: DataObject, value: T, filter: any, options?: KalmanFilterOptions): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const kf = new KalmanFilter(filter.R, filter.Q, filter.A, filter.B, filter.C, filter.x, filter.cov);
            kf.filter(value);

            // Save the node data
            filter.x = kf.measurement;
            filter.cov = kf.covariance;
            resolve(kf.measurement);
        });
    }

}

export class KalmanFilterOptions extends FilterOptions {
    /** Process noise */
    public R: number | number[];
    /** Measurement noise */
    public Q: number | number[];
    /** State vector */
    public A: number | number[];
    /** Control vector */
    public B: number | number[];
    /** Measurement vector */
    public C: number | number[];
}

/**
 * Basic Kalman Filter
 * @author Wouter Bulten
 * @see {@link http://github.com/wouterbulten/kalmanjs}
 * @copyright Copyright 2015-2018 Wouter Bulten
 * @license MIT License
 */
class KalmanFilter<T extends number | number[]> {
    /** Process noise */
    private _R: T;
    /** Measurement noise */
    private _Q: T;
    /** State vector */
    private _A: T;
    /** Control vector */
    private _B: T;
    /** Measurement vector */
    private _C: T;

    /** Noise filtered estimated signal */
    private _x: T;
    /** Covariance */
    private _cov: T;

    constructor(R: T, Q: T, A: T, B: T, C: T, x: T, cov: T) {
        this._R = R;
        this._Q = Q;
        this._A = A;
        this._B = B;
        this._C = C;

        this._x = x;
        this._cov = cov;
    }

    /**
     * Filter a new value
     * @param  {Number} z Measurement
     * @param  {Number} u Control
     * @return {Number}
     */
    public filter(z: T, u?: T): T {
        if (this._x === undefined) {
            const ct = math.divide(1, this._C);
            this._x = math.multiply(ct, z) as T;
            this._cov = math.multiply(math.multiply(ct, this._Q), ct)  as T;
        } else {
            // Compute prediction
            const predX = this.predict(u);
            const predCov = this.uncertainty();

            // Kalman gain
            const K = math.multiply(math.multiply(predCov, this._C), math.divide(1, math.add(math.multiply(math.multiply(this._C, predCov), this._C), this._Q)));

            // Correction
            this._x = math.add(predX, math.multiply(K, math.subtract(z, math.multiply(this._C, predX)))) as T;
            this._cov = math.subtract(predCov, math.multiply(math.multiply(K, this._C), predCov)) as T;
        }

        return this._x;
    }

    /**
     * Predict next value
     * @param  {Number} [u] Control
     * @return {Number}
     */
    public predict(u?: T): T {
        return math.add(math.multiply(this._A, this._x), u === undefined ? 0 : math.multiply(this._B, u)) as T;
    }
    
    /**
     * Return uncertainty of filter
     * @return {Number}
     */
    public uncertainty(): T {
        return math.add(math.multiply(math.multiply(this._A, this._cov), this._A), this._R) as T;
    }
    
    /**
     * Return the last filtered measurement
     * @return {Number}
     */
    public get measurement(): T {
        return this._x;
    }

    public get covariance(): T {
        return this._cov;
    }
}

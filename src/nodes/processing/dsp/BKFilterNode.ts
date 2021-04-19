import { PropertyFilterProcessingNode } from './PropertyFilterProcessingNode';
import { FilterProcessingOptions } from './FilterProcessingNode';
import { DataObject, DataFrame } from '../../../data';
import { Vector3 } from '../../../utils';

/**
 * Basic Kalman Filter processing node
 *
 * @category Processing node
 */
export class BKFilterNode<InOut extends DataFrame> extends PropertyFilterProcessingNode<InOut> {
    constructor(
        propertySelector: (object: DataObject, frame?: InOut) => [any, PropertyKey],
        options: KalmanFilterOptions,
    ) {
        super(propertySelector, options);
    }

    public initFilter<T extends number | Vector3>(
        object: DataObject,
        value: T,
        options: KalmanFilterOptions,
    ): Promise<any> {
        return new Promise<any>((resolve) => {
            Object.keys(options).forEach((key) => {
                if (typeof (options as any)[key] === 'number' && key in ['R', 'Q', 'A', 'B', 'C']) {
                    (options as any)[key] = new Vector3((options as any)[key], 0, 0);
                }
            });
            resolve({ x: undefined, cov: NaN, ...options });
        });
    }

    public filter<T extends number | Vector3>(object: DataObject, value: T, filter: any): Promise<T> {
        return new Promise<T>((resolve) => {
            const kf = new KalmanFilter(filter.R, filter.Q, filter.A, filter.B, filter.C, filter.x, filter.cov);
            const numeric = typeof value === 'number';
            if (numeric) {
                kf.filter(new Vector3(value as number, 0, 0));
            } else {
                kf.filter(value as Vector3);
            }

            // Save the node data
            filter.x = kf.measurement;
            filter.cov = kf.covariance;

            if (numeric) {
                resolve(kf.measurement.x);
            } else {
                resolve(kf.measurement);
            }
        });
    }
}

export interface KalmanFilterOptions extends FilterProcessingOptions {
    /** Process noise */
    R: number | Vector3;
    /** Measurement noise */
    Q: number | Vector3;
    /** State vector */
    A: number | Vector3;
    /** Control vector */
    B: number | Vector3;
    /** Measurement vector */
    C: number | Vector3;
}

/**
 * Basic Kalman Filter
 *
 * @author Wouter Bulten
 * @see {@link http://github.com/wouterbulten/kalmanjs}
 * @copyright Copyright 2015-2018 Wouter Bulten
 * @license MIT
 */
class KalmanFilter<T extends Vector3> {
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
     *
     * @param  {number} z Measurement
     * @param  {number} u Control
     * @returns {number} Filtered value
     */
    public filter(z: Vector3, u?: Vector3): Vector3 {
        if (this._x === undefined) {
            const ct = new Vector3(1, 1, 1).divide(this._C);
            this._x = ct.clone().multiply(z) as T;
            this._cov = ct.clone().multiply(this._Q).multiply(ct) as T;
        } else {
            // Compute prediction
            const predX = this.predict(u);
            const predCov = this.uncertainty();

            // Kalman gain
            const K = predCov
                .clone()
                .multiply(this._C)
                .multiply(
                    new Vector3(1, 1, 1).divide(this._C.clone().multiply(predCov).multiply(this._C).add(this._Q)),
                );

            // Correction
            this._x = predX.clone().add(K.clone().multiply(z.clone().sub(this._C.clone().multiply(predX)))) as T;
            this._cov = predCov.clone().sub(K.clone().multiply(this._C).multiply(predCov));
        }

        return this._x;
    }

    /**
     * Predict next value
     *
     * @param  {number} [u] Control
     * @returns {number} Predicted value
     */
    public predict(u?: Vector3): Vector3 {
        return this._A
            .clone()
            .multiply(this._x)
            .add(u === undefined ? new Vector3() : this._B.clone().multiply(u));
    }

    /**
     * Return uncertainty of filter
     *
     * @returns {number} Uncertainty
     */
    public uncertainty(): T {
        return this._A.clone().multiply(this._cov).multiply(this._A).add(this._R);
    }

    /**
     * Return the last filtered measurement
     *
     * @returns {number} Last measurement
     */
    public get measurement(): T {
        return this._x;
    }

    public get covariance(): T {
        return this._cov;
    }
}

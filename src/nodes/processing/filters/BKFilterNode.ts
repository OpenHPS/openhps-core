import { DataFrame } from "../../../data/DataFrame";
import { FilterNode, FilterOptions } from "./FilterNode";

/**
 * Basic Kalman Filter processing node
 */
export class BKFilterNode<InOut extends DataFrame> extends FilterNode<InOut> {
    constructor(options: KalmanFilterOptions, properties: string[] = null) {
        super(null, properties);
    }

    public initFilter(value: number, options: KalmanFilterOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve({ x: NaN, cov: NaN, ...options });
        });
    }
    
    public filter(value: number, filter: any, options?: KalmanFilterOptions): Promise<number> {
        return new Promise<number>((resolve, reject) => {
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
    public R: number;
    /** Measurement noise */
    public Q: number;
    /** State vector */
    public A: number;
    /** Control vector */
    public B: number;
    /** Measurement vector */
    public C: number;
}

/**
 * Basic Kalman Filter
 * @author Wouter Bulten
 * @see {@link http://github.com/wouterbulten/kalmanjs}
 * @copyright Copyright 2015-2018 Wouter Bulten
 * @license MIT License
 */
class KalmanFilter {
    /** Process noise */
    private _R: number;
    /** Measurement noise */
    private _Q: number;
    /** State vector */
    private _A: number;
    /** Control vector */
    private _B: number;
    /** Measurement vector */
    private _C: number;

    /** Noise filtered estimated signal */
    private _x: number;
    /** Covariance */
    private _cov: number;

    constructor(R: number = 1, Q: number = 1, A: number = 1, B: number = 1, C: number = 1, x: number = NaN, cov: number = NaN) {
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
    public filter(z: number, u: number = 0): number {

        if (isNaN(this._x)) {
            this._x = (1 / this._C) * z;
            this._cov = (1 / this._C) * this._Q * (1 / this._C);
        } else {
            // Compute prediction
            const predX = this.predict(u);
            const predCov = this.uncertainty();

            // Kalman gain
            const K = predCov * this._C * (1 / ((this._C * predCov * this._C) + this._Q));

            // Correction
            this._x = predX + K * (z - (this._C * predX));
            this._cov = predCov - (K * this._C * predCov);
        }

        return this._x;
    }

    /**
     * Predict next value
     * @param  {Number} [u] Control
     * @return {Number}
     */
    public predict(u: number = 0): number {
        return (this._A * this._x) + (this._B * u);
    }
    
    /**
     * Return uncertainty of filter
     * @return {Number}
     */
    public uncertainty(): number {
        return ((this._A * this._cov) * this._A) + this._R;
    }
    
    /**
     * Return the last filtered measurement
     * @return {Number}
     */
    public get measurement(): number {
        return this._x;
    }

    public get covariance(): number {
        return this._cov;
    }
}

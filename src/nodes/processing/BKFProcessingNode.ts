import { DataFrame, DataObject, SerializableObject, SerializableArrayMember } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";

export class BKFProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    constructor() {
        super();
    }

    public processObject(dataObject: DataObject): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            // Extract all sensor values from the data object
        });
    }

}
/**
 * Basic Kalman Filter
 * @author Wouter Bulten
 * @see {@link http://github.com/wouterbulten/kalmanjs}
 * @copyright Copyright 2015-2018 Wouter Bulten
 * @license MIT License
 */
@SerializableObject()
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


    constructor(R: number = 1, Q: number = 1, A: number = 1, B: number = 1, C: number = 1) {
        this._R = R;
        this._Q = Q;
        this._A = A;
        this._B = B;
        this._C = C;
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
    public lastMeasurement(): number {
        return this._x;
    }

    /**
     * Set measurement noise Q
     * @param {Number} noise
     */
    public setMeasurementNoise(noise: number): void {
        this._Q = noise;
    }

    /**
     * Set the process noise R
     * @param {Number} noise
     */
    public setProcessNoise(noise: number): void {
        this._R = noise;
    }
}

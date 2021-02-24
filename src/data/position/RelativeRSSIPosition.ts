import { RelativeDistancePosition } from './RelativeDistancePosition';
import { SerializableObject, SerializableMember } from '../decorators';

/**
 * @category Position
 */
@SerializableObject()
export class RelativeRSSIPosition extends RelativeDistancePosition {
    private _rssi: number;
    @SerializableMember()
    public environmenFactor: number;
    private _calibratedRSSI: number;

    constructor(referenceObject?: any, rssi?: number) {
        super(referenceObject);
        this.rssi = rssi;
    }

    public get referenceValue(): number {
        if (this.environmenFactor && this.calibratedRSSI) {
            return this.distance;
        } else {
            return this.rssi;
        }
    }

    public set referenceValue(value: number) {
        if (this.environmenFactor && this.calibratedRSSI) {
            this.distance = value;
        } else {
            this.rssi = value;
        }
    }

    @SerializableMember()
    public get rssi(): number {
        return this._rssi;
    }

    public set rssi(rssi: number) {
        this._rssi = rssi;
        if (this.environmenFactor && this.calibratedRSSI) {
            // Set distance from RSSI
            super.distance = Math.pow(10, (this.calibratedRSSI - this.rssi) / (10 * this.environmenFactor));
        }
    }

    public get distance(): number {
        if (super.distance === undefined && this.rssi && this.environmenFactor && this.calibratedRSSI) {
            this.rssi = this._rssi;
        }
        return super.distance;
    }

    public set distance(value: number) {
        super.distance = value;
        if (this.environmenFactor && this.calibratedRSSI) {
            // Set RSSI from distance
            this._rssi =
                this.calibratedRSSI -
                (this.calibratedRSSI +
                    (10 * this.environmenFactor * Math.log10(Math.abs(this.distance)) - this.calibratedRSSI));
        }
    }

    @SerializableMember()
    public get calibratedRSSI(): number {
        return this._calibratedRSSI;
    }

    public set calibratedRSSI(calibratedRSSI: number) {
        this._calibratedRSSI = calibratedRSSI;
    }
}

import { RelativeDistancePosition } from "./RelativeDistancePosition";
import { SerializableObject, SerializableMember } from "../decorators";

@SerializableObject()
export class RelativeRSSIPosition extends RelativeDistancePosition {
    private _rssi: number;
    private _environmenFactor: number;
    private _calibratedRSSI: number;

    constructor(referenceObject?: any, rssi?: number) {
        super(referenceObject);
        this.rssi = rssi;
    }

    @SerializableMember()
    public get rssi(): number {
        return this._rssi;
    }

    public set rssi(rssi: number) {
        this._rssi = rssi;
    }

    @SerializableMember()
    public get distance(): number {
        return Math.pow(10, (this.calibratedRSSI - this.rssi) / (10 * this.environmenFactor));
    }

    public set distance(distance: number) {
        super.distance = distance;
        this.rssi = this.calibratedRSSI - (this.calibratedRSSI + (10 * this.environmenFactor * Math.log10(Math.abs(distance)) - this.calibratedRSSI));
    }

    @SerializableMember()
    public get calibratedRSSI(): number {
        return this._calibratedRSSI;
    }

    public set calibratedRSSI(calibratedRSSI: number) {
        this._calibratedRSSI = calibratedRSSI;
    }

    @SerializableMember()
    public get environmenFactor(): number {
        return this._environmenFactor;
    }

    public set environmenFactor(environmenFactor: number) {
        this._environmenFactor = environmenFactor;
    }
}

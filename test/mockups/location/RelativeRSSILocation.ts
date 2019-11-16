import { RelativeDistanceLocation } from "../../../src";

export class RelativeRSSILocation extends RelativeDistanceLocation {
    private _rssi: number;

    public getRSSI() : number {
        return this._rssi;
    }

    public setRSSI(rssi: number) : void {
        this._rssi = rssi;
    }
}
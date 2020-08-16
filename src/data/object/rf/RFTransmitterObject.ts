import { RFObject } from './RFObject';
import { SerializableObject, SerializableMember } from '../../decorators';
import { DataObject } from '../DataObject';

@SerializableObject()
export class RFTransmitterObject extends DataObject implements RFObject {
    private _rfTransmissionPower: number = -1;
    private _calibratedRSSI: number = -69;
    private _environmenFactor: number;

    constructor(uid?: string, calibratedRSSI?: number, txPower?: number) {
        super(uid);
        this.calibratedRSSI = calibratedRSSI;
        this.txPower = txPower;
    }

    /**
     * Get RF transmission power
     */
    @SerializableMember()
    public get txPower(): number {
        return this._rfTransmissionPower;
    }

    /**
     * Set RF transmission power
     * @param transmissionPower RF transmission power
     */
    public set txPower(transmissionPower: number) {
        this._rfTransmissionPower = transmissionPower;
    }

    /**
     * Get the calibrated rssi at 1 meter
     */
    public get calibratedRSSI(): number {
        return this._calibratedRSSI;
    }

    /**
     * Set the calibrated rssi at 1 meter
     */
    public set calibratedRSSI(calibratedRSSI: number) {
        if (calibratedRSSI > 0) {
            throw new RangeError('');
        }
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

import { SerializableObject } from '../decorators';
import { RFTransmitterObject } from '../object/rf';
import { RelativeValue } from './RelativeValue';

/**
 * @category Position
 */
@SerializableObject()
export class RelativeRSSI extends RelativeValue {
    constructor(referenceObject?: RFTransmitterObject | string, rssi?: number) {
        super(referenceObject, rssi);
    }

    public get rssi(): number {
        return this.referenceValue;
    }

    public set rssi(rssi: number) {
        this.referenceValue = rssi;
    }
}

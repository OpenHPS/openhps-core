import { SerializableMember, SerializableObject } from '../decorators';
import { RFTransmitterObject } from '../object/rf';
import { RelativePosition } from './RelativePosition';

/**
 * @category Position
 */
@SerializableObject()
export class RelativeRSSI extends RelativePosition<number> {
    constructor(referenceObject?: RFTransmitterObject | string, rssi?: number) {
        super(referenceObject, rssi);
    }

    @SerializableMember()
    public get rssi(): number {
        return this.referenceValue;
    }

    public set rssi(rssi: number) {
        this.referenceValue = rssi;
    }
}

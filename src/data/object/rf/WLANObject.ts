import { RFTransmitterObject } from './RFTransmitterObject';
import { SerializableObject, SerializableMember } from '../../decorators';

@SerializableObject()
export class WLANObject extends RFTransmitterObject {
    private _channel: number;

    /**
     * WLAN Channel
     */
    @SerializableMember()
    public get channel(): number {
        return this._channel;
    }

    public set channel(channel: number) {
        this._channel = channel;
    }
}

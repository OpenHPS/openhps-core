import { RFTransmitterObject } from './RFTransmitterObject';
import { SerializableObject, SerializableMember } from '../../decorators';

@SerializableObject()
export class WLANObject extends RFTransmitterObject {
    /**
     * WLAN Channel
     */
    @SerializableMember()
    public channel: number;
}

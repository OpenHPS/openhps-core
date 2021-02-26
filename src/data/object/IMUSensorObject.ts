import { SerializableMember, SerializableObject } from '../decorators';
import { DataObject } from './DataObject';

@SerializableObject()
export class IMUSensorObject extends DataObject {
    @SerializableMember()
    public frequency: number;
}

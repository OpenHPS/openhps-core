import { SerializableArrayMember, SerializableMember, SerializableObject } from '../decorators';
import { v4 as uuidv4 } from 'uuid';
import { AbsolutePosition, AbsolutePositionDeserializer } from './AbsolutePosition';

@SerializableObject()
export class Trajectory {
    @SerializableMember()
    uid: string = uuidv4();
    @SerializableMember()
    objectUID: string;
    @SerializableArrayMember(() => Object, {
        deserializer: (json: any[]) => {
            return json.map(AbsolutePositionDeserializer);
        },
    })
    positions: AbsolutePosition[] = [];

    get trajectoryStart(): number {
        if (!this.positions || this.positions.length === 0) return -1;
        return this.positions[0].timestamp;
    }

    get trajectoryEnd(): number {
        if (!this.positions || this.positions.length === 0) return -1;
        return this.positions[this.positions.length - 1].timestamp;
    }

    constructor(objectUID: string) {
        this.objectUID = objectUID;
    }
}

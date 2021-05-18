import { SerializableArrayMember, SerializableMember, SerializableObject } from '../decorators';
import { v4 as uuidv4 } from 'uuid';
import { AbsolutePosition } from './AbsolutePosition';

@SerializableObject()
export class Trajectory {
    @SerializableMember({
        primaryKey: true,
    })
    uid: string = uuidv4();
    @SerializableMember({
        index: true,
    })
    objectUID: string;
    @SerializableArrayMember(AbsolutePosition)
    positions: AbsolutePosition[] = [];

    get trajectoryStart(): number {
        if (!this.positions || this.positions.length === 0) return -1;
        return this.positions[0].timestamp;
    }

    get trajectoryEnd(): number {
        if (!this.positions || this.positions.length === 0) return -1;
        return this.positions[this.positions.length - 1].timestamp;
    }

    constructor(objectUID?: string) {
        this.objectUID = objectUID;
    }
}

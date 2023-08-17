import { SerializableArrayMember, SerializableMember, SerializableObject, NumberType } from '../decorators';
import { v4 as uuidv4 } from 'uuid';
import { AbsolutePosition } from './AbsolutePosition';
import { TimeService } from '../../service/TimeService';

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
    /**
     * Created timestamp
     */
    @SerializableMember({
        index: true,
        numberType: NumberType.LONG,
    })
    createdTimestamp: number;

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
        this.createdTimestamp = TimeService.now();
    }
}

import { TimeService } from '../../service/TimeService';
import { Unit } from '../../utils';
import { DataSerializer } from '../DataSerializer';
import { SerializableMember, SerializableObject } from '../decorators';
import { Accuracy } from '../values/Accuracy';
import { Position } from './Position';

/**
 * Relative position to another reference object or space.
 *
 * @category Position
 */
@SerializableObject()
export abstract class RelativePosition<T = number> implements Position {
    /**
     * Position recording timestamp
     */
    @SerializableMember({
        index: true,
    })
    timestamp: number = TimeService.now();
    /**
     * Reference object UID that this location is relative to
     */
    @SerializableMember()
    referenceObjectUID: string;
    @SerializableMember()
    referenceObjectType: string;
    referenceValue: T;
    private _accuracy: Accuracy;

    /**
     * Position accuracy
     *
     * @returns {Accuracy} Position accuracy
     */
    @SerializableMember()
    get accuracy(): Accuracy {
        if (!this._accuracy) {
            this._accuracy = new Accuracy(0, Unit.UNKNOWN);
        }
        return this._accuracy;
    }

    set accuracy(value: Accuracy) {
        if (!value) {
            throw new Error(`Accuracy can not be undefined!`);
        }
        this.accuracy = value;
    }

    constructor(referenceObject?: any, value?: T) {
        if (referenceObject !== undefined) {
            if (referenceObject instanceof String || typeof referenceObject === 'string') {
                this.referenceObjectUID = referenceObject as string;
            } else {
                this.referenceObjectType = referenceObject.constructor.name;
                this.referenceObjectUID = referenceObject.uid;
            }
        }
        this.referenceValue = value;
    }

    /**
     * Set the accuracy of the absolute position
     *
     * @param {number | Accuracy} accuracy Accuracy object or number
     * @param {Unit} [unit] Optional unit
     * @returns {RelativePosition} instance
     */
    setAccuracy(accuracy: number | Accuracy, unit?: Unit): this {
        if (typeof accuracy === 'number') {
            this.accuracy = new Accuracy(accuracy, unit || Unit.UNKNOWN);
        } else {
            this.accuracy = accuracy;
        }
        return this;
    }

    public equals(position: this): boolean {
        return this.timestamp === position.timestamp;
    }

    /**
     * Clone the position
     *
     * @returns {RelativePosition} Cloned relative position
     */
    public clone(): this {
        const serialized = DataSerializer.serialize(this);
        const clone = DataSerializer.deserialize(serialized) as this;
        return clone;
    }
}

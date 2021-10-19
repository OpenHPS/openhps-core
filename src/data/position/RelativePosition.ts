import { TimeService } from '../../service/TimeService';
import { Unit } from '../../utils';
import { DataSerializer } from '../DataSerializer';
import { SerializableMember, SerializableObject } from '../decorators';
import { Accuracy } from '../values/Accuracy';
import { Accuracy1D } from '../values/Accuracy1D';
import { Position } from './Position';

/**
 * Relative position to another reference object or space.
 *
 * @category Position
 */
@SerializableObject()
export abstract class RelativePosition<T = number, U extends Unit = Unit> implements Position<U> {
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
    @SerializableMember()
    referenceValue: T;
    @SerializableMember({
        name: 'accuracy',
    })
    private _accuracy: Accuracy<U, any>;
    @SerializableMember({
        name: 'probability',
    })
    private _probability: number;
    private _defaultUnit: U;

    /**
     * Get the position probability
     *
     * @returns {number} Probability between 0 and 1
     */
    get probability(): number {
        if (!this._probability) {
            return 1 / this.accuracy.valueOf();
        }
        return this._probability;
    }

    set probability(value: number) {
        if (value > 1 || value < 0) {
            throw new Error(`${this.constructor.name} should be between 0 and 1.`);
        }
        this._probability = value;
    }

    /**
     * Position accuracy
     *
     * @returns {Accuracy} Position accuracy
     */
    get accuracy(): Accuracy<U, any> {
        if (!this._accuracy) {
            this._accuracy = new Accuracy1D(1, this._defaultUnit);
        }
        return this._accuracy;
    }

    set accuracy(value: Accuracy<U, any>) {
        if (!value) {
            throw new Error(`Accuracy can not be undefined!`);
        }
        this.accuracy = value;
    }

    constructor(referenceObject?: any, value?: T, unit?: U) {
        if (referenceObject !== undefined) {
            if (referenceObject instanceof String || typeof referenceObject === 'string') {
                this.referenceObjectUID = referenceObject as string;
            } else {
                this.referenceObjectType = referenceObject.constructor.name;
                this.referenceObjectUID = referenceObject.uid;
            }
        }
        this._defaultUnit = unit || (Unit.UNKNOWN as U);
        this.referenceValue = value;
    }

    /**
     * Set the accuracy of the absolute position
     *
     * @param {number | Accuracy} accuracy Accuracy object or number
     * @param {Unit} [unit] Optional unit
     * @returns {RelativePosition} instance
     */
    setAccuracy(accuracy: number | Accuracy<U, any>, unit?: U): this {
        if (typeof accuracy === 'number') {
            this.accuracy = new Accuracy1D(accuracy, unit || this._defaultUnit);
        } else {
            this.accuracy = accuracy;
        }
        return this;
    }

    equals(position: this): boolean {
        return this.timestamp === position.timestamp;
    }

    /**
     * Clone the position
     *
     * @returns {RelativePosition} Cloned relative position
     */
    clone(): this {
        const serialized = DataSerializer.serialize(this);
        const clone = DataSerializer.deserialize(serialized) as this;
        return clone;
    }
}

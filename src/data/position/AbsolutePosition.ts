import { Position } from './Position';
import { LengthUnit, Unit } from '../../utils/unit';
import { Vector3 } from '../../utils/math';
import { Velocity } from '../values/Velocity';
import { LinearVelocity } from '../values/LinearVelocity';
import { AngularVelocity } from '../values/AngularVelocity';
import { Orientation } from './Orientation';
import { SerializableMember, SerializableObject } from '../decorators';
import { TimeService } from '../../service/TimeService';
import { Accuracy } from '../values/Accuracy';
import { Accuracy1D } from '../values/Accuracy1D';
import { DistanceFn, EUCLIDEAN } from '../../utils';

/**
 * An absolute position of a [[DataObject]].
 *
 * @category Position
 */
@SerializableObject()
export abstract class AbsolutePosition implements Position<LengthUnit> {
    /**
     * Position recording timestamp
     */
    @SerializableMember({
        index: true,
    })
    timestamp: number = TimeService.now();
    /**
     * Velocity at recorded position
     */
    @SerializableMember()
    velocity: Velocity = new Velocity();
    /**
     * Orientation at recorded position
     */
    @SerializableMember()
    orientation: Orientation;
    /**
     * Position unit
     */
    @SerializableMember()
    unit: LengthUnit = LengthUnit.METER;
    /**
     * Position reference space UID
     */
    @SerializableMember({
        index: true,
    })
    referenceSpaceUID: string;
    @SerializableMember({
        name: 'accuracy',
    })
    private _accuracy: Accuracy<LengthUnit, any>;
    @SerializableMember({
        name: 'probability',
    })
    private _probability: number;

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
    get accuracy(): Accuracy<LengthUnit, any> {
        if (!this._accuracy) {
            this._accuracy = new Accuracy1D(1, this.unit);
        }
        return this._accuracy;
    }

    set accuracy(value: Accuracy<LengthUnit, any>) {
        if (!value) {
            throw new Error(`Accuracy can not be undefined!`);
        }
        this._accuracy = value;
    }

    /**
     * Get the linear velocity
     *
     * @returns {LinearVelocity} Linear velocity
     */
    get linearVelocity(): LinearVelocity {
        if (!this.velocity) {
            return undefined;
        }
        return this.velocity.linear;
    }

    /**
     * Set the linear velocity
     */
    set linearVelocity(value: LinearVelocity) {
        if (!this.velocity) {
            this.velocity = new Velocity();
        }
        this.velocity.linear = value;
    }

    /**
     * Get the angular velocity
     *
     * @returns {AngularVelocity} Angular velocity
     */
    get angularVelocity(): AngularVelocity {
        if (!this.velocity) {
            return undefined;
        }
        return this.velocity.angular;
    }

    /**
     * Set the angular velocity
     */
    set angularVelocity(value: AngularVelocity) {
        if (!this.velocity) {
            this.velocity = new Velocity();
        }
        this.velocity.angular = value;
    }

    /**
     * Set the accuracy of the absolute position
     *
     * @param {number | Accuracy} accuracy Accuracy object or number
     * @param {Unit} [unit] Optional unit
     * @returns {AbsolutePosition} instance
     */
    setAccuracy(accuracy: number | Accuracy<LengthUnit, any>, unit?: Unit): this {
        if (typeof accuracy === 'number') {
            this.accuracy = new Accuracy1D(accuracy, unit || this.unit);
        } else {
            this.accuracy = accuracy;
        }
        return this;
    }

    abstract fromVector(vector: Vector3, unit?: LengthUnit): this;

    abstract toVector3(unit?: LengthUnit): Vector3;

    /**
     * Get the angle in radians from this position to a destination
     *
     * @param {AbsolutePosition} destination Destination position
     * @returns {number} Bearing in radians from this position to destination
     */
    abstract angleTo(destination: this): number;

    /**
     * Get the distance from this location to a destination
     *
     * @param {AbsolutePosition} destination Destination location
     * @param {DistanceFn} [distanceFunction] Distance function to use (default EUCLIDEAN distance)
     * @returns {number} Distance between this point and destination
     */
    distanceTo(destination: this, distanceFunction: DistanceFn = EUCLIDEAN): number {
        return distanceFunction(this.toVector3().toArray(), destination.toVector3().toArray());
    }

    equals(position: this): boolean {
        return this.toVector3(this.unit).equals(position.toVector3(this.unit));
    }

    /**
     * Clone the position
     *
     * @returns {AbsolutePosition} Cloned position
     */
    clone(): this {
        const position = new (this.constructor as new () => this)();
        position.unit = this.unit;
        position._accuracy = this._accuracy ? this._accuracy.clone() : undefined;
        position.orientation = this.orientation ? this.orientation.clone() : undefined;
        position.velocity = this.velocity ? this.velocity.clone() : undefined;
        position.timestamp = this.timestamp;
        position.referenceSpaceUID = this.referenceSpaceUID;
        return position as this;
    }
}

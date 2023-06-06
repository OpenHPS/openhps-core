import { SerializableObject } from '../../decorators';
import { AngularVelocity } from '../../values';
import { SensorObject } from '../SensorObject';

/**
 * The gyroscope provides on each reading the angular velocity of the device along all three axes.
 * @category data
 */
@SerializableObject()
export class Gyroscope extends SensorObject<AngularVelocity> {
    constructor(uid?: string, value?: AngularVelocity, frequency?: number, displayName?: string) {
        super(uid, value ?? new AngularVelocity(), frequency, displayName);
    }
}

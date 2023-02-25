import { SerializableObject } from '../../decorators';
import { LinearVelocity } from '../../values';
import { SensorObject } from '../SensorObject';

/**
 * The linear velocity sensors provides on each reading the linear velocity of the device along all three axes.
 *
 * @category data
 */
@SerializableObject()
export class LinearVelocitySensor extends SensorObject<LinearVelocity> {
    constructor(uid?: string, value?: LinearVelocity, frequency?: number, displayName?: string) {
        super(uid, value ?? new LinearVelocity(), frequency, displayName);
    }
}

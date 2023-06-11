import { SerializableObject } from '../../decorators';
import { Acceleration } from '../../values';
import { SensorObject } from '../SensorObject';

/**
 * The gravity sensor provides on each reading the gravity applied to the device along all three axes.
 *
 * @category data
 */
@SerializableObject()
export class GravitySensor extends SensorObject<Acceleration> {
    constructor(uid?: string, value?: Acceleration, frequency?: number, displayName?: string) {
        super(uid, value ?? new Acceleration(), frequency, displayName);
    }
}

import { SerializableObject } from '../decorators';
import { Accuracy3D } from './Accuracy3D';

@SerializableObject()
export class GeographicalAccuracy extends Accuracy3D {
    get horizontalAccuracy(): number {
        return this.x + this.y / 2;
    }

    set horizontalAccuracy(val: number) {
        this.x = val;
        this.y = val;
    }

    get verticalAccuracy(): number {
        return this.z;
    }

    set verticalAccuracy(val: number) {
        this.z = val;
    }
}

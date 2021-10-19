import { SerializableObject } from '../decorators';
import { Accuracy3D } from './Accuracy3D';

@SerializableObject()
export class GeographicalAccuracy extends Accuracy3D {
    get latitudeAccuracy(): number {
        return this.x;
    }

    set latitudeAccuracy(value: number) {
        this.x = value;
    }

    get longitudeAccuracy(): number {
        return this.y;
    }

    set longitudeAccuracy(value: number) {
        this.y = value;
    }

    get horizontalAccuracy(): number {
        return this.latitudeAccuracy + this.longitudeAccuracy / 2;
    }

    set horizontalAccuracy(val: number) {
        this.latitudeAccuracy = val;
        this.longitudeAccuracy = val;
    }

    get verticalAccuracy(): number {
        return this.z;
    }

    set verticalAccuracy(val: number) {
        this.z = val;
    }
}

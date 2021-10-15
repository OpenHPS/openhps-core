import { SerializableObject } from '../decorators';
import { Accuracy3D } from './Accuracy3D';

@SerializableObject()
export class GeographicalAccuracy extends Accuracy3D {
    get horizontalAccuracy(): number {
        return this.x + this.y / 2;
    }
}

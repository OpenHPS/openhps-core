import { SerializableMapMember, SerializableMember, SerializableObject } from '../decorators';
import { DataObject } from './DataObject';

@SerializableObject()
export class ActuatableProperty {
    @SerializableMember()
    name: string;
    @SerializableMember()
    callback: (...args: any[]) => Promise<any>;
}

/**
 * An actuatable object is a spatial object with actuatable properties
 * that can trigger a state change.
 */
@SerializableObject()
export class ActuatableObject extends DataObject {
    @SerializableMapMember(String, () => ActuatableProperty)
    protected properties: Map<string, ActuatableProperty> = new Map();

    invoke(method: string, ...args: any[]): Promise<any> {
        const property = this.properties.get(method);
        if (!property) {
            return Promise.resolve(undefined);
        }
        return property.callback(args);
    }
}

import { SerializableMapMember, SerializableMember, SerializableObject } from '../decorators';
import { DataObject } from './DataObject';

@SerializableObject()
export class ActuatorProperty {
    @SerializableMember()
    name: string;
    @SerializableMember()
    callback: (...args: any[]) => Promise<any>;
}

/**
 * An actuator object is a spatial object with actuator properties
 * that can trigger a state change.
 */
@SerializableObject()
export class ActuatorObject extends DataObject {
    @SerializableMapMember(String, () => ActuatorProperty)
    protected properties: Map<string, ActuatorProperty> = new Map();

    invoke(method: string, ...args: any[]): Promise<any> {
        const property = this.properties.get(method);
        if (!property) {
            return Promise.resolve(undefined);
        }
        return property.callback(args);
    }
}

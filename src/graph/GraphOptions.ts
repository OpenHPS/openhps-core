import 'reflect-metadata';
import { SerializableObject } from '../data';
import { TypedJSON } from 'typedjson';

@SerializableObject()
export class GraphOptions {

    public serialize(): string {
        const serializer = new TypedJSON(Object.getPrototypeOf(this).constructor);
        return serializer.stringify(this);
    }

    public static deserialize<T extends GraphOptions>(serialized: string, dataType: new () => T): T {
        const serializer = new TypedJSON(dataType);
        return serializer.parse(serialized);
    }

    public toJson(): any {
        const serializer = new TypedJSON(Object.getPrototypeOf(this).constructor);
        return serializer.toPlainJson(this);
    }

}

import 'reflect-metadata';
import { jsonObject, TypedJSON } from 'typedjson';

@jsonObject
export class GraphOptions {

    public serialize(): string {
        const serializer = new TypedJSON(Object.getPrototypeOf(this).constructor);
        return serializer.stringify(this);
    }

    public static deserialize<T extends GraphOptions>(serialized: string, dataType: new () => T): T {
        const serializer = new TypedJSON(dataType);
        return serializer.parse(serialized);
    }

}

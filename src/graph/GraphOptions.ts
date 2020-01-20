import 'reflect-metadata';
import { jsonObject, TypedJSON } from 'typedjson';

@jsonObject
export class GraphOptions {

    constructor() {
        const knownTypes = (GraphOptions.prototype as any)['__typedJsonJsonObjectMetadataInformation__'].knownTypes as Set<any>;
        knownTypes.add(this.constructor);
    }

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

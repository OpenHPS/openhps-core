import { AbsoluteLocation } from "../data";
import { DataServiceDriver } from "./DataServiceDriver";

export abstract class DataObjectServiceDriver<I, T> extends DataServiceDriver<I, T> {

    constructor(dataType: new () => T, options?: any) {
        super(dataType, options);
    }

    public abstract findByCurrentLocation(location: AbsoluteLocation): Promise<T[]>;
}

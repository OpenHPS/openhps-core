import { Location } from "../location";

/**
 * # OpenHPS: Data Service
 */
export class DataService<T> {
    private _typeName: string;

    constructor(){
    }

    public setType<K>(type: { new (): K }) {
        this._typeName = type.name;
    }

    /**
     * Get data manager type name
     */
    public getTypeName() {
        return this._typeName;
    }
}
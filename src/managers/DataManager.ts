export class DataManager<T> {
    private _typeName: string;

    constructor(type : new () => T) {
        this._typeName = type.name;
    }

    /**
     * Get data manager type name
     */
    public getTypeName() {
        return this._typeName;
    }
}
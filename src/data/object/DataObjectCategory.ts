export class DataObjectCategory {
    public static DEFAULT = new DataObjectCategory("default");

    private _name: string;

    constructor(name: string) {
        this._name = name;
    }

    /**
     * Get data object category name
     */
    public getName(): string {
        return this._name;
    }

    /**
     * Set data object category name
     * @param name Category name
     */
    public setName(name: string): void {
        this._name = name;
    }
}

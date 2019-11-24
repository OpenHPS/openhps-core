/**
 * # OpenHPS: Service
 */
export abstract class Service {
    private _name: string;

    constructor(name: string = null) {
        this._name = name === null ? this.constructor.name : name;
    }

    /**
     * Get data manager name
     */
    public getName() {
        return this._name;
    }

}

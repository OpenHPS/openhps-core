import { Model } from "../Model";

/**
 * # OpenHPS: Service
 */
export abstract class Service {
    private _name: string;
    private _models: Array<Model<any, any>> = new Array<Model<any, any>>();

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

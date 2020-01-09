import { ServiceContainer } from './ServiceContainer';

/**
 * Service is accessible by each [[Node]] inside the [[Model]]
 */
export abstract class Service {
    private _name: string;
    private _models: ServiceContainer[] = new Array();

    constructor(name: string = null) {
        this._name = name === null ? this.constructor.name : name;
    }

    /**
     * Get data manager name
     */
    public getName() {
        return this._name;
    }

    public getServiceContainers(): ServiceContainer[] {
        return this._models;
    }

    public registerServiceContainer(model: ServiceContainer): boolean {
        this._models.push(model);
        return true;
    }
}

import { AsyncEventEmitter } from "../_internal/AsyncEventEmitter";

/**
 * Service is accessible by each [[Node]] inside the [[Model]]
 */
export abstract class Service extends AsyncEventEmitter {
    private _name: string;
    public logger: (level: string, log: any) => void = () => {};
    private _ready: boolean = false;

    constructor(name: string = null) {
        super();
        this._name = name === null ? this.constructor.name : name;

        this.prependOnceListener('ready', () => {
            this._ready = true;
        });
    }

    /**
     * Get data manager name
     */
    public get name() {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public isReady(): boolean {
        return this._ready;
    }

}

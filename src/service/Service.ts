import { AsyncEventEmitter } from "../_internal/AsyncEventEmitter";
import { ModelImpl } from "../graph/_internal/implementations";

/**
 * Service is accessible by each [[Node]] inside the [[Model]]
 */
export abstract class Service extends AsyncEventEmitter {
    /**
     * Service name
     */
    public name: string;
    public logger: (level: string, log: any) => void = () => true;
    public model: ModelImpl<any, any>;
    private _ready = false;

    constructor() {
        super();
        this.name = this.constructor.name;

        this.prependOnceListener('ready', () => {
            this._ready = true;
        });
    }

    public isReady(): boolean {
        return this._ready;
    }

}

import { AsyncEventEmitter } from '../_internal/AsyncEventEmitter';

/**
 * Service is accessible by each [[Node]] inside the [[Model]]
 */
export abstract class Service extends AsyncEventEmitter {
    /**
     * Service name
     */
    public name: string;
    public logger: (level: string, log: any) => void = () => true;
    private _ready = false;
    /**
     * Model shape
     */
    public model: any;

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

    public emit(name: string | symbol, ...args: any[]): boolean;
    /**
     * Service ready
     *
     * @param {string} name ready
     */
    public emit(name: 'ready'): boolean;
    /**
     * Destroy the service
     *
     * @param {string} name destroy
     */
    public emit(name: 'destroy'): boolean;
    public emit(name: string | symbol, ...args: any[]): boolean {
        return super.emit(name, ...args);
    }

    public once(name: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Event called when service is destroyed
     *
     * @param {string} name destroy
     * @param {Function} listener Event callback
     */
    public once(name: 'destroy', listener: () => void | Promise<void>): this;
    /**
     * Event called when service is build
     *
     * @param {string} name build
     * @param {Function} listener Event callback
     */
    public once(name: 'build', listener: () => void | Promise<void>): this;
    /**
     * Event called when service is ready
     *
     * @param {string} name ready
     * @param {Function} listener Event callback
     */
    public once(name: 'ready', listener: () => void | Promise<void>): this;
    public once(name: string | symbol, listener: (...args: any[]) => void): this {
        return super.once(name, listener);
    }
}

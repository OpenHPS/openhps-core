import { AsyncEventEmitter } from '../_internal/AsyncEventEmitter';

/**
 * Service is accessible by each [[Node]] inside the [[Model]]
 */
export abstract class Service extends AsyncEventEmitter {
    /**
     * Service name
     */
    public uid: string;
    public logger: (level: string, log: any) => void = () => true;
    private _ready = false;
    /**
     * Model shape
     */
    public model: any;

    constructor() {
        super();
        this.uid = this.constructor.name;

        this.prependOnceListener('ready', () => {
            this._ready = true;
        });
    }

    /**
     * @deprecated use uid instead
     * @returns {string} uid
     */
    public get name(): string {
        return this.uid;
    }

    /**
     * @deprecated use uid instead
     * @param {string} value uid
     */
    public set name(value: string) {
        this.uid = value;
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

import { AsyncEventEmitter } from '../_internal/AsyncEventEmitter';

/**
 * Service is accessible by each [[Node]] inside the [[Model]]
 */
export abstract class Service extends AsyncEventEmitter {
    /**
     * Service name
     */
    uid: string;
    logger: (level: string, log: any) => void = () => true;
    private _ready = false;
    /**
     * Model shape
     */
    model: any;

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
    get name(): string {
        return this.uid;
    }

    /**
     * @deprecated use uid instead
     * @param {string} value uid
     */
    set name(value: string) {
        this.uid = value;
    }

    isReady(): boolean {
        return this._ready;
    }

    emit(name: string | symbol, ...args: any[]): boolean;
    /**
     * Service ready
     *
     * @param {string} name ready
     */
    emit(name: 'ready'): boolean;
    /**
     * Destroy the service
     *
     * @param {string} name destroy
     */
    emit(name: 'destroy'): boolean;
    emit(name: string | symbol, ...args: any[]): boolean {
        return super.emit(name, ...args);
    }

    once(name: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Event called when service is destroyed
     *
     * @param {string} name destroy
     * @param {Function} listener Event callback
     */
    once(name: 'destroy', listener: () => void | Promise<void>): this;
    /**
     * Event called when service is build
     *
     * @param {string} name build
     * @param {Function} listener Event callback
     */
    once(name: 'build', listener: () => void | Promise<void>): this;
    /**
     * Event called when service is ready
     *
     * @param {string} name ready
     * @param {Function} listener Event callback
     */
    once(name: 'ready', listener: () => void | Promise<void>): this;
    once(name: string | symbol, listener: (...args: any[]) => void): this {
        return super.once(name, listener);
    }
}

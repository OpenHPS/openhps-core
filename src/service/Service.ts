import { AsyncEventEmitter } from '../_internal/AsyncEventEmitter';
import { v4 as uuidv4 } from 'uuid';
import { SerializableMember, SerializableObject } from '../data/decorators';

/**
 * Service is accessible by each {@link Node} inside the {@link Model}
 */
@SerializableObject()
export abstract class Service extends AsyncEventEmitter {
    /**
     * Service name
     */
    @SerializableMember()
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

    protected generateUUID(): string {
        return uuidv4();
    }

    setUID(uid: string): this {
        this.uid = uid;
        return this;
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
        if (name === 'ready' && this.isReady()) {
            listener();
            return this;
        }
        return super.once(name, listener);
    }
}

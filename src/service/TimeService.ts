import { Service } from './Service';
import { TimeUnit } from '../utils';
import { SerializableMember, SerializableMemberFunction, SerializableObject } from '../data/decorators';

/**
 * Time service for retrieving the current time.
 */
@SerializableObject()
export class TimeService extends Service {
    @SerializableMemberFunction()
    private _timeCallback: () => number;
    @SerializableMember()
    private _timeUnit: TimeUnit;
    private static _defaultTimeCallback: () => number;
    private static _defaultUnit: TimeUnit;

    constructor(timeCallback?: () => number, unit: TimeUnit = TimeUnit.MILLISECOND) {
        super();
        this._timeCallback = timeCallback;
        this._timeUnit = unit;
        this.uid = this.constructor.name;

        // Specify the default time callback used by class initializers
        if (!TimeService._defaultTimeCallback) {
            TimeService.initialize();
        }

        // If time callback is undefined, use the default
        if (!this._timeCallback) {
            this._timeCallback = TimeService.now;
            this._timeUnit = TimeService.getUnit();
        } else {
            TimeService._defaultTimeCallback = timeCallback;
            TimeService._defaultUnit = unit;
        }
    }

    @SerializableMember()
    get isDefault(): boolean {
        return TimeService._defaultTimeCallback === this._timeCallback;
    }

    set isDefault(value: boolean) {
        if (value) {
            TimeService._defaultTimeCallback = this._timeCallback;
            TimeService._defaultUnit = this._timeUnit;
        }
    }

    public static initialize() {
        TimeService._defaultTimeCallback = Date.now;
        TimeService._defaultUnit = TimeUnit.MILLISECOND;
        // Specify the default time callback used by class initializers
        try {
            const microtime = require('microtime');
            // Check if function exists, needed for webpack
            if (microtime.now) {
                TimeService._defaultTimeCallback = microtime.now;
                TimeService._defaultUnit = TimeUnit.MICROSECOND;
            }
        } catch (ex) {
            return;
        }
    }

    /**
     * Get the current time
     * @returns {number} Current time
     */
    public getTime(): number {
        return this._timeCallback();
    }

    /**
     * Get the time unit
     * @returns {TimeUnit} Unit of time service
     */
    public getUnit(): TimeUnit {
        return this._timeUnit;
    }

    /**
     * Get the current time
     * @returns {number} Current time in a specific unit
     */
    public static now(): number {
        if (!TimeService._defaultTimeCallback) {
            TimeService.initialize();
        }
        return TimeService._defaultTimeCallback();
    }

    public static getUnit(): TimeUnit {
        if (!TimeService._defaultTimeCallback) {
            TimeService.initialize();
        }
        return TimeService._defaultUnit;
    }
}

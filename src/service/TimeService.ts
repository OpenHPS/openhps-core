import { Service } from './Service';
import { TimeUnit } from '../utils';

export class TimeService extends Service {
    private _timeCallback: () => number;
    private _timeUnit: TimeUnit;
    private static _defaultTimeCallback: () => number;
    private static _defaultUnit: TimeUnit;

    constructor(timeCallback?: () => number, unit: TimeUnit = TimeUnit.MILLISECOND) {
        super();
        this._timeCallback = timeCallback;
        this._timeUnit = unit;

        // Speciy the default time callback used by class initializers
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

    public static initialize() {
        // Speciy the default time callback used by class initializers
        try {
            // eslint-disable-next-line
            const microtime = require('microtime');
            TimeService._defaultTimeCallback = microtime.now;
            TimeService._defaultUnit = TimeUnit.MICROSECOND;
        } catch (ex) {
            TimeService._defaultTimeCallback = Date.now;
            TimeService._defaultUnit = TimeUnit.MILLISECOND;
        }
    }

    /**
     * Get the current time
     *
     * @returns {number} Current time
     */
    public getTime(): number {
        return this._timeCallback();
    }

    /**
     * Get the time unit
     *
     * @returns {TimeUnit} Unit of time service
     */
    public getUnit(): TimeUnit {
        return this._timeUnit;
    }

    /**
     * Get the current time
     *
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

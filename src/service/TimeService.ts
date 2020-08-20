import { Service } from './Service';
import { TimeUnit } from '../utils';

export class TimeService extends Service {
    private _timeCallback: () => number;
    private _timeUnit: TimeUnit;

    constructor(timeCallback: () => number = () => new Date().getTime(), unit: TimeUnit = TimeUnit.MILLISECOND) {
        super();
        this._timeCallback = timeCallback;
        this._timeUnit = unit;
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
}

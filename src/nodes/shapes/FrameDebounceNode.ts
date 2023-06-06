import { DataFrame } from '../../data';
import { ProcessingNode } from '../ProcessingNode';
import { TimeUnit } from '../../utils';

/**
 * @category Flow shape
 */
export class FrameDebounceNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _timeout: number;
    private _timeoutUnit: TimeUnit;
    private _timer: NodeJS.Timeout;
    private _accept = true;

    constructor(timeout: number, timeoutUnit: TimeUnit) {
        super();
        this._timeout = timeout;
        this._timeoutUnit = timeoutUnit;

        this.once('build', this._start.bind(this));
        this.once('destroy', this._stop.bind(this));
    }

    /**
     * Start the timeout timer
     * @returns {Promise<void>} Timer promise
     */
    private _start(): Promise<void> {
        return new Promise((resolve) => {
            this._timer = setInterval(() => {
                this._accept = true;
            }, this._timeoutUnit.convert(this._timeout, TimeUnit.MILLISECOND));
            resolve();
            this.emit('ready');
        });
    }

    private _stop(): void {
        if (this._timer !== undefined) {
            clearInterval(this._timer);
        }
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            if (this._accept) {
                this._accept = false;
                resolve(frame);
            } else {
                resolve(undefined);
            }
        });
    }
}

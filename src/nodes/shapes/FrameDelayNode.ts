import { DataFrame } from '../../data';
import { TimeUnit } from '../../utils';
import { MemoryBufferNode } from './MemoryBufferNode';

/**
 * Frame delay node to delay pushing of frames.
 *
 * @category Flow shape
 */
export class FrameDelayNode<InOut extends DataFrame> extends MemoryBufferNode<InOut> {
    private _timeout: number;
    private _timeoutUnit: TimeUnit;
    private _timer: NodeJS.Timeout;

    constructor(timeout: number, timeoutUnit: TimeUnit) {
        super();
        this._timeout = timeout;
        this._timeoutUnit = timeoutUnit;

        this.once('build', this._start.bind(this));
        this.once('destroy', this._stop.bind(this));
    }

    /**
     * Start the timeout timer
     *
     * @returns {Promise<void>} Timer promise
     */
    private _start(): Promise<void> {
        return new Promise((resolve) => {
            this._timer = setInterval(() => {
                this.onPull();
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
}

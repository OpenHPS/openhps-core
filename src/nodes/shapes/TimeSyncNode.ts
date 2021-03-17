import { DataFrame } from '../../data/DataFrame';
import { TimeService } from '../../service';
import { BufferOptions } from './BufferNode';
import { MemoryBufferNode } from './MemoryBufferNode';

/**
 * Time synchronization node.
 *
 * @category Flow shape
 */
export class TimeSyncNode<InOut extends DataFrame> extends MemoryBufferNode<InOut> {
    private _timer: NodeJS.Timer;

    constructor(options?: TimeSyncOptions) {
        super(options);
        this.on('build', this._initTimer.bind(this));
        this.on('destroy', this._stopTimer.bind(this));
    }

    private _initTimer(): void {
        this._timer = setInterval(() => {
            this.triggerUpdate();
        }, 10);
    }

    private _stopTimer(): void {
        clearInterval(this._timer);
    }

    protected triggerUpdate(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.shift()
                .then((frame) => {
                    if (frame) {
                        this.outlets.forEach((outlet) => outlet.push(frame));
                        return this.triggerUpdate();
                    } else {
                        resolve();
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    }

    protected next(): Promise<InOut> {
        return new Promise((resolve, reject) => {
            super
                .next()
                .then((frame) => {
                    if (frame && frame.createdTimestamp <= TimeService.now()) {
                        return resolve(frame);
                    }
                    resolve(undefined);
                })
                .catch(reject);
        });
    }
}

export type TimeSyncOptions = BufferOptions;

import { DataFrame } from '../../data/DataFrame';
import { PushOptions } from '../../graph/options';
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
    protected options: TimeSyncOptions;

    constructor(options?: TimeSyncOptions) {
        super(options);
        this.on('build', this._initTimer.bind(this));
        this.on('destroy', this._stopTimer.bind(this));
    }

    private _initTimer(): void {
        this._timer = setInterval(() => {
            this.triggerUpdate();
        }, this.options.checkInterval || 100);
    }

    private _stopTimer(): void {
        clearInterval(this._timer);
    }

    public onPush(frame: InOut, options?: PushOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            if (frame.createdTimestamp <= TimeService.now()) {
                this.triggerUpdate()
                    .then(() => {
                        this.outlets.forEach((outlet) => outlet.push(frame, options));
                        resolve();
                    })
                    .catch(reject);
            } else {
                super
                    .onPush(frame)
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
            }
        });
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

export interface TimeSyncOptions extends BufferOptions {
    checkInterval?: number;
}

import { DataFrame } from '../../data/DataFrame';
import { BufferOptions } from './BufferNode';
import { MemoryBufferNode } from './MemoryBufferNode';

/**
 * @category Flow shape
 */
export class ThrottleNode<InOut extends DataFrame> extends MemoryBufferNode<InOut> {
    private _pushReady = true;

    constructor(options?: BufferOptions) {
        super(options);
        this.on('push', this.onThrottlePush.bind(this));
    }

    public onThrottlePush(): Promise<void> {
        return this._handlePush();
    }

    private _handlePush(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._pushReady) {
                this._pushReady = false;
                this.onPull()
                    .then(() => {
                        // Ready
                        this._pushReady = true;
                        return this.service.count();
                    })
                    .then((count) => {
                        if (count > 0) {
                            setTimeout(this._handlePush.bind(this), 10);
                        }
                        resolve();
                    })
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }
}

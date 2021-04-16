import { DataFrame } from '../../data';
import { TimeUnit } from '../../utils';
import { ProcessingNode } from '../ProcessingNode';

/**
 * Frame delay node to delay pushing of frames.
 *
 * @category Flow shape
 */
export class FrameDelayNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _timeout: number;
    private _timeoutUnit: TimeUnit;

    constructor(timeout: number, timeoutUnit: TimeUnit) {
        super();
        this._timeout = timeout;
        this._timeoutUnit = timeoutUnit;
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(frame);
            }, this._timeoutUnit.convert(this._timeout, TimeUnit.MILLISECOND));
        });
    }
}

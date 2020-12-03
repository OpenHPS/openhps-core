import { DataFrame } from '../../data';
import { ProcessingNode, ProcessingNodeOptions } from '../ProcessingNode';

export class FrameFilterNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _filterFn: (frame: InOut) => boolean;

    constructor(filterFn: (frame: InOut) => boolean, options?: ProcessingNodeOptions) {
        super(options);
        this._filterFn = filterFn;
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            if (this._filterFn(frame)) {
                resolve(frame);
            } else {
                resolve(undefined);
            }
        });
    }
}

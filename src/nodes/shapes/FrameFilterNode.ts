import { DataFrame } from '../../data';
import { ProcessingNode, ProcessingNodeOptions } from '../ProcessingNode';

/**
 * @category Flow shape
 */
export class FrameFilterNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    constructor(filterFn: (frame: InOut) => boolean, options?: ProcessingNodeOptions) {
        super(options);
        this.options.frameFilter = filterFn;
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            if (this.options.frameFilter(frame)) {
                resolve(frame);
            } else {
                resolve(undefined);
            }
        });
    }
}

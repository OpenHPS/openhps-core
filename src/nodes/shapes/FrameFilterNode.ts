import { DataFrame } from '../../data';
import { ProcessingNode, ProcessingNodeOptions } from '../ProcessingNode';

/**
 * @category Flow shape
 */
export class FrameFilterNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    protected filterFn: (frame: InOut) => boolean;

    constructor(filterFn: (frame: InOut) => boolean, options?: ProcessingNodeOptions) {
        super(options);
        this.options.frameFilter = () => true;
        this.filterFn = filterFn;
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            if (this.filterFn(frame)) {
                resolve(frame);
            } else {
                resolve(undefined);
            }
        });
    }
}

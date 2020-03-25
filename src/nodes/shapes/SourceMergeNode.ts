import { DataFrame } from "../../data";
import { TimeUnit } from "../../utils";
import { FrameMergeNode } from './FrameMergeNode';

/**
 * Source merge node. This node merges the data frames from multiple sources into one.
 * 
 * ## Usage
 * Merging is done by determining the incoming edges, once the amount of received frames from unique sources is
 * the same as the incoming edges, the frames are merged and pushed.
 * 
 * It is possible to set a timeout, when this timeout is reached the frames that are received are merged and pushed.
 * 
 * When frames of the same source are received they are overridden.
 */
export class SourceMergeNode<InOut extends DataFrame> extends FrameMergeNode<InOut> {

    constructor(timeout: number, timeoutUnit: TimeUnit) {
        super((frame: InOut) => {
            if (frame.source === undefined) {
                return null;
            }
            return frame.source.uid;
        }, (frame: InOut) => {
            return frame.uid;
        }, timeout, timeoutUnit);
    }

}

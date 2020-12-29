import { DataFrame, DataObject } from '../../data';
import { PushOptions } from '../../graph';
import { ObjectProcessingNodeOptions } from '../ObjectProcessingNode';
import { FrameMergeNode } from './FrameMergeNode';
import { MergeShapeOptions } from './MergeShape';

export class ObjectMergeNode<InOut extends DataFrame> extends FrameMergeNode<InOut> {
    protected options: ObjectMergeOptions;

    constructor(groupFn: (frame: InOut, options?: PushOptions) => any, options?: ObjectMergeOptions) {
        super(
            (frame: InOut) =>
                frame
                    .getObjects()
                    .filter((value: DataObject) => this.options.objectFilter(value, frame))
                    .map((object) => object.uid),
            groupFn,
            options,
        );
        this.options.objectFilter = this.options.objectFilter || (() => true);
    }

    public merge(frames: InOut[]): InOut {
        const mergedFrame = super.merge(frames);
        mergedFrame
            .getObjects()
            .filter((object) => !this.options.objectFilter(object, mergedFrame))
            .forEach((obj) => {
                mergedFrame.removeObject(obj);
            });
        return mergedFrame;
    }
}

export interface ObjectMergeOptions extends MergeShapeOptions, ObjectProcessingNodeOptions {}

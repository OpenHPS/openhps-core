import { DataFrame, DataObject } from '../../data';
import { TimeUnit } from '../../utils';
import { FrameMergeNode } from './FrameMergeNode';

export class ObjectMergeNode<InOut extends DataFrame> extends FrameMergeNode<InOut> {
    private _filterFn: (object: DataObject, frame?: InOut) => boolean;

    constructor(
        filterFn: (object: DataObject, frame?: InOut) => boolean,
        groupFn: (frame: InOut) => any,
        timeout: number,
        timeoutUnit: TimeUnit,
    ) {
        super(
            (frame: InOut) =>
                frame
                    .getObjects()
                    .filter((value: DataObject) => this._filterFn(value, frame))
                    .map((object) => object.uid),
            groupFn,
            timeout,
            timeoutUnit,
        );
        this._filterFn = filterFn;
    }

    public merge(frames: InOut[], objectUID: string): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            const mergedFrame = frames[0];
            const existingObject = mergedFrame.getObjectByUID(objectUID);

            for (let i = 1; i < frames.length; i++) {
                const frame = frames[i];
                const object = frame.getObjectByUID(objectUID);

                if (object) {
                    // Merge object
                    object.relativePositions.forEach((value) => {
                        existingObject.addRelativePosition(value);
                    });
                    if (existingObject.getPosition() === undefined) {
                        existingObject.setPosition(object.getPosition());
                    } else if (existingObject.getPosition().accuracy < object.getPosition().accuracy) {
                        // TODO: Merge location using different tactic + check accuracy unit
                        existingObject.setPosition(object.getPosition());
                    }

                    // Merge properties
                    Object.keys(frame).forEach((propertyName) => {
                        const value = (mergedFrame as any)[propertyName];
                        if (value === undefined || value === null) {
                            (mergedFrame as any)[propertyName] = (frame as any)[propertyName];
                        }
                    });
                }
            }
            resolve(mergedFrame);
        });
    }
}

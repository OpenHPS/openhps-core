import { DataFrame, DataObject } from '../../data';
import { PushOptions } from '../../graph';
import { FrameMergeNode, FrameMergeOptions } from './FrameMergeNode';

export class ObjectMergeNode<InOut extends DataFrame> extends FrameMergeNode<InOut> {
    constructor(groupFn: (frame: InOut, options?: PushOptions) => any, options?: FrameMergeOptions) {
        super(
            (frame: InOut) =>
                frame
                    .getObjects()
                    .filter((value: DataObject) => this.options.objectFilter(value, frame))
                    .map((object) => object.uid),
            groupFn,
            options,
        );
    }

    public merge(frames: InOut[], objectUID: string): Promise<InOut> {
        return new Promise<InOut>((resolve) => {
            const mergedFrame = frames[0];
            const mergedObjects: Map<string, DataObject[]> = new Map();
            mergedFrame.getObjects().forEach((object) => {
                if (mergedObjects.get(object.uid)) {
                    mergedObjects.get(object.uid).push(object);
                } else {
                    mergedObjects.set(object.uid, [object]);
                }
            });

            const existingObject = mergedFrame.getObjectByUID(objectUID);

            for (let i = 1; i < frames.length; i++) {
                const frame = frames[i];
                const object = frame.getObjectByUID(objectUID);

                if (object) {
                    // Merge object
                    object.relativePositions.forEach((value) => {
                        existingObject.addRelativePosition(value);
                    });
                    frame.getObjects().forEach((object) => {
                        if (!mergedFrame.hasObject(object)) {
                            // Add object
                            mergedFrame.addObject(object);
                            mergedObjects.set(object.uid, [object]);
                        } else {
                            mergedObjects.get(object.uid).push(object);
                        }
                    });

                    // Merge properties
                    Object.keys(frame).forEach((propertyName) => {
                        const value = (mergedFrame as any)[propertyName];
                        if (value === undefined || value === null) {
                            (mergedFrame as any)[propertyName] = (frame as any)[propertyName];
                        }
                    });
                }
            }

            // Merge objects using the merging function
            mergedObjects.forEach((values) => {
                const mergedObject = this.mergeObjects(values);
                mergedFrame.addObject(mergedObject);
            });

            resolve(mergedFrame);
        });
    }
}

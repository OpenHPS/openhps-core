import { AbsolutePosition, DataFrame, DataObject } from '../../data';
import { FrameMergeNode, FrameMergeOptions } from './FrameMergeNode';

export class ObjectMergeNode<InOut extends DataFrame> extends FrameMergeNode<InOut> {
    constructor(groupFn: (frame: InOut) => any, options?: FrameMergeOptions) {
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
            const existingObject = mergedFrame.getObjectByUID(objectUID);
            const positions: AbsolutePosition[] = [];

            for (let i = 1; i < frames.length; i++) {
                const frame = frames[i];
                const object = frame.getObjectByUID(objectUID);

                if (object) {
                    // Merge object
                    object.relativePositions.forEach((value) => {
                        existingObject.addRelativePosition(value);
                    });
                    const position = object.getPosition();
                    if (position) {
                        positions.push(object.getPosition());
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

            if (positions.length === 1) {
                existingObject.setPosition(positions[0]);
            } else if (positions.length > 0) {
                // Weighted merging
                const baseUnit = positions[0].unit;
                const newPosition: AbsolutePosition = positions[0].clone();
                newPosition.fromVector(newPosition.toVector3().divideScalar(newPosition.accuracy));
                let totalAccuracy = newPosition.accuracy;
                for (let i = 1; i < positions.length; i++) {
                    newPosition.fromVector(
                        newPosition
                            .toVector3(baseUnit)
                            .add(positions[i].toVector3(baseUnit).divideScalar(positions[i].accuracy)),
                    );
                    totalAccuracy += positions[i].accuracy;
                }
                newPosition.fromVector(newPosition.toVector3(baseUnit).multiplyScalar(totalAccuracy));
                existingObject.setPosition(newPosition);
            }

            resolve(mergedFrame);
        });
    }
}

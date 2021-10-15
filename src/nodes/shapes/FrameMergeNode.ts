import { AbsolutePosition, Accuracy, DataFrame, DataObject, LinearVelocity, Orientation } from '../../data';
import { MergeShape } from './MergeShape';

/**
 * Merges two or more frames together based on a merge key.
 *
 * ## Usage
 * ```typescript
 * new FrameMergeNode();
 * ```
 *
 * @category Flow shape
 */
export class FrameMergeNode<InOut extends DataFrame> extends MergeShape<InOut> {
    /**
     * Merge multiple data objects together
     *
     * @param {DataObject[]} objects Data objects
     * @returns {DataObject} Merged data object
     */
    public mergeObjects(objects: DataObject[]): DataObject {
        const baseObject = objects[0];
        // Relative positions
        for (let i = 1; i < objects.length; i++) {
            objects[i].getRelativePositions().forEach((relativePos) => {
                baseObject.addRelativePosition(relativePos);
            });
        }

        // Weighted position merging
        const positions = objects.map((object) => object.getPosition()).filter((position) => position !== undefined);
        if (positions.length === 0) {
            return baseObject;
        }

        let newPosition: AbsolutePosition = positions[0].clone();
        for (let i = 1; i < positions.length; i++) {
            newPosition = this.mergePositions(newPosition, positions[i].clone());
        }
        if (newPosition.accuracy) {
            newPosition.accuracy.setValue(1 / newPosition.accuracy.valueOf());
        }
        if (newPosition.linearVelocity) {
            newPosition.linearVelocity.setAccuracy(1 / newPosition.linearVelocity.accuracy.valueOf());
        }
        baseObject.setPosition(newPosition);
        return baseObject;
    }

    public mergePositions(positionA: AbsolutePosition, positionB: AbsolutePosition): AbsolutePosition {
        const newPosition = positionA;
        if (!positionB) {
            return newPosition;
        }

        // Accuracy of the two positions
        const posAccuracyA = positionA.accuracy || new Accuracy(1, positionA.unit);
        let posAccuracyB = positionB.accuracy || new Accuracy(1, positionB.unit);
        posAccuracyB = posAccuracyB.to(posAccuracyA.unit);

        // Apply position merging
        newPosition.fromVector(
            newPosition
                .toVector3()
                .multiplyScalar(1 / posAccuracyA.valueOf())
                .add(positionB.toVector3(newPosition.unit).multiplyScalar(1 / posAccuracyB.valueOf())),
        );
        newPosition.fromVector(
            newPosition.toVector3().divideScalar(1 / posAccuracyA.valueOf() + 1 / posAccuracyB.valueOf()),
        );
        newPosition.accuracy.setValue(1 / (posAccuracyA.valueOf() + posAccuracyB.valueOf()));

        newPosition.linearVelocity = this._mergeVelocity(newPosition.linearVelocity, positionB.linearVelocity);
        newPosition.orientation = this._mergeOrientation(newPosition.orientation, positionB.orientation);

        // Average timestamp
        newPosition.timestamp = Math.round(
            (positionA.timestamp * (1 / posAccuracyA.valueOf()) + positionB.timestamp * (1 / posAccuracyB.valueOf())) /
                (1 / posAccuracyA.valueOf() + 1 / posAccuracyB.valueOf()),
        );
        return newPosition;
    }

    private _mergeVelocity(velocityA: LinearVelocity, velocityB: LinearVelocity): LinearVelocity {
        if (velocityB) {
            if (velocityA) {
                const lvAccuracyA = velocityA.accuracy;
                const lvAccuracyB = velocityB.accuracy;
                // Merge linear velocity
                velocityA
                    .multiplyScalar(1 / lvAccuracyA.valueOf())
                    .add(velocityB.multiplyScalar(1 / lvAccuracyB.valueOf()));
                velocityA.divideScalar(1 / lvAccuracyA.valueOf() + 1 / lvAccuracyB.valueOf());
                velocityA.setAccuracy(1 / (lvAccuracyA.valueOf() + lvAccuracyB.valueOf()));
            } else {
                velocityA = velocityB;
            }
        }
        return velocityA;
    }

    private _mergeOrientation(orientationA: Orientation, orientationB: Orientation): Orientation {
        if (orientationB) {
            if (orientationA) {
                const accuracyA = orientationA.accuracy || 1;
                const accuracyB = orientationB.accuracy || 1;
                const slerp = (1 / accuracyA.valueOf() + 1 / accuracyB.valueOf()) / accuracyB.valueOf() / 2;
                orientationA.slerp(orientationB, slerp);
            } else {
                orientationA = orientationB;
            }
        }
        return orientationA;
    }

    /**
     * Merge the data frames
     *
     * @param {DataFrame[]} frames Data frames to merge
     * @returns {Promise<DataFrame>} Promise of merged data frame
     */
    public merge(frames: InOut[]): InOut {
        const mergedFrame = frames[0];
        const mergedObjects: Map<string, DataObject[]> = new Map();
        mergedFrame.getObjects().forEach((object) => {
            if (mergedObjects.get(object.uid)) {
                mergedObjects.get(object.uid).push(object);
            } else {
                mergedObjects.set(object.uid, [object]);
            }
        });

        for (let i = 1; i < frames.length; i++) {
            const frame = frames[i];
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

        // Merge objects using the merging function
        mergedObjects.forEach((values) => {
            const mergedObject = this.mergeObjects(values);
            mergedFrame.addObject(mergedObject);
        });

        return mergedFrame;
    }
}

import {
    DataFrame,
    DataObject,
    RelativeDistancePosition,
    AbsolutePosition,
    Absolute2DPosition,
    Absolute3DPosition,
    GeographicalPosition,
} from '../../data';
import { RelativePositionProcessing } from './RelativePositionProcessing';
import { ObjectProcessingNodeOptions } from '../ObjectProcessingNode';

/**
 * Trillateration processing node
 * Supported location types:
 * - [[Absolute2DPosition]]
 * - [[Absolute3DPosition]]
 * - [[GeographicalPosition]]
 */
export class TrilaterationNode<InOut extends DataFrame> extends RelativePositionProcessing<
    InOut,
    RelativeDistancePosition
> {
    constructor(options?: ObjectProcessingNodeOptions) {
        super(RelativeDistancePosition, options);
    }

    public processRelativePositions<P extends Absolute2DPosition | Absolute3DPosition | GeographicalPosition>(
        dataObject: DataObject,
        relativePositions: Map<RelativeDistancePosition, DataObject>,
    ): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const objects: DataObject[] = [];
            const points: P[] = [];
            const distances: number[] = [];
            relativePositions.forEach((object, relativePosition) => {
                if (object.getPosition()) {
                    objects.push(object);
                    points.push(object.getPosition() as P);
                    distances.push(relativePosition.distance);
                }
            });

            let position: P;
            switch (objects.length) {
                case 0:
                case 1:
                    return resolve(dataObject);
                case 2:
                    position = points[0].midpoint(points[1] as any, distances[0], distances[1]) as P;
                    if (position !== null) dataObject.setPosition(position);
                    return resolve(dataObject);
                case 3:
                    this.trilaterate(points, distances)
                        .then((position) => {
                            if (position !== null) dataObject.setPosition(position);
                            resolve(dataObject);
                        })
                        .catch(reject);
                    break;
                default:
                    return resolve(dataObject);
            }
        });
    }

    public trilaterate<P extends AbsolutePosition>(points: P[], distances: number[]): Promise<P> {
        return new Promise<P>((resolve) => {
            const vectors = [points[0].toVector3(), points[1].toVector3(), points[2].toVector3()];
            const eX = vectors[1].clone().sub(vectors[0]).divideScalar(vectors[1].clone().sub(vectors[0]).length());
            const i = eX.dot(vectors[2].clone().sub(vectors[0]));
            const a = vectors[2].clone().sub(vectors[0]).sub(eX.clone().multiplyScalar(i));
            const eY = a.clone().divideScalar(a.length());
            const j = eY.dot(vectors[2].clone().sub(vectors[0]));
            const eZ = eX.clone().multiply(eY);
            const d = vectors[1].clone().sub(vectors[0]).length();

            // Calculate coordinates
            let AX = distances[0];
            let BX = distances[1];
            let CX = distances[2];

            let b = -1;
            let x = 0;
            let y = 0;
            do {
                x = (Math.pow(AX, 2) - Math.pow(BX, 2) + Math.pow(d, 2)) / (2 * d);
                y = (Math.pow(AX, 2) - Math.pow(CX, 2) + Math.pow(i, 2) + Math.pow(j, 2)) / (2 * j) - (i / j) * x;
                b = Math.pow(AX, 2) - Math.pow(x, 2) - Math.pow(y, 2);

                // Increase distances
                AX += 0.1;
                BX += 0.1;
                CX += 0.1;
            } while (b < 0);
            const z = Math.sqrt(b);
            if (isNaN(z)) {
                return resolve(null);
            }

            const point = points[0].clone();
            point.unit = points[0].unit;
            point.fromVector(
                vectors[0].clone().add(eX.multiplyScalar(x)).add(eY.multiplyScalar(y)).add(eZ.multiplyScalar(z)),
            );
            return resolve((point as unknown) as P);
        });
    }
}

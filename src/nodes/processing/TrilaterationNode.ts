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
 *
 * @category Processing node
 */
export class TrilaterationNode<InOut extends DataFrame> extends RelativePositionProcessing<
    InOut,
    RelativeDistancePosition
> {
    protected options: TrilaterationOptions;

    constructor(options?: TrilaterationOptions) {
        super(RelativeDistancePosition, options);
        this.options.incrementStep = this.options.incrementStep || 1;
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
                default:
                    this.trilaterate(points, distances)
                        .then((position) => {
                            if (position !== null) dataObject.setPosition(position);
                            resolve(dataObject);
                        })
                        .catch(reject);
                    break;
            }
        });
    }

    public trilaterate<P extends AbsolutePosition>(points: P[], distances: number[]): Promise<P> {
        return new Promise<P>((resolve) => {
            const v = points.map((p) => p.toVector3());
            const ex = v[1].sub(v[0]).clone().divideScalar(v[1].length());
            const i = ex.dot(v[2].clone().sub(v[0]));
            const a = v[2].clone().sub(v[0]).sub(ex.clone().multiplyScalar(i));
            const ey = a.clone().divideScalar(a.length());
            const ez = ex.clone().cross(ey);
            const d = v[1].clone().sub(v[0]).length();
            const j = ey.clone().dot(v[2].clone().sub(v[0]));

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
                AX += this.options.incrementStep;
                BX += this.options.incrementStep;
                CX += this.options.incrementStep;
            } while (b < 0);
            const z = Math.sqrt(b);
            if (isNaN(z)) {
                return resolve(null);
            }

            const point = points[0].clone();
            point.unit = points[0].unit;
            point.fromVector(
                v[0].clone().add(ex.multiplyScalar(x)).add(ey.multiplyScalar(y)).add(ez.multiplyScalar(z)),
            );
            return resolve((point as unknown) as P);
        });
    }
}

export interface TrilaterationOptions extends ObjectProcessingNodeOptions {
    /**
     * Maximum number of iterations
     */
    maxIterations?: number;
    tolerance?: number;
    /**
     * Incrementation step
     */
    incrementStep?: number;
}

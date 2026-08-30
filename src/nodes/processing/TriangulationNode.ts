import {
    DataObject,
    DataFrame,
    RelativeAngle,
    AbsolutePosition,
    Absolute2DPosition,
    Absolute3DPosition,
    GeographicalPosition,
} from '../../data';
import { AngleUnit, Vector3 } from '../../utils';
import { RelativePositionProcessing } from './RelativePositionProcessing';
import { ObjectProcessingNodeOptions } from '../ObjectProcessingNode';

/**
 * Triangulation processing node
 * Supported position types:
 * - {@link Absolute2DPosition}
 * - {@link Absolute3DPosition}
 * - {@link GeographicalPosition}
 * @rdf {@link http://purl.org/poso/Triangulation}
 * @category Processing node
 */
export class TriangulationNode<InOut extends DataFrame> extends RelativePositionProcessing<InOut, RelativeAngle> {
    constructor(options?: ObjectProcessingNodeOptions) {
        super(RelativeAngle, options);
    }

    public processRelativePositions<P extends Absolute2DPosition | Absolute3DPosition | GeographicalPosition>(
        dataObject: DataObject,
        relativePositions: Map<RelativeAngle, DataObject>,
        dataFrame: DataFrame,
    ): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const objects: DataObject[] = [];
            const points: P[] = [];
            const angles: number[] = [];
            relativePositions.forEach((object, relativePosition) => {
                if (object.getPosition()) {
                    objects.push(object);
                    points.push(object.getPosition() as P);
                    angles.push(relativePosition.unit.convert(relativePosition.angle, AngleUnit.RADIAN));
                }
            });

            switch (objects.length) {
                case 0:
                case 1:
                    return resolve(dataObject);
                case 2:
                    // Two angles constrain the object to a line rather than a point. Resolving
                    // without a position matches every other insufficient-input branch; falling
                    // out of the switch here left the promise pending forever.
                    return resolve(dataObject);
                case 3:
                    this.triangulate(points, angles)
                        .then((position) => {
                            if (position !== null) {
                                position.timestamp = dataFrame.createdTimestamp;
                                dataObject.setPosition(position);
                            }
                            resolve(dataObject);
                        })
                        .catch(reject);
                    break;
                default:
                    return resolve(dataObject);
            }
        });
    }

    /**
     * Triangulate a absolute 3d location
     * @see {@link https://ieeexplore.ieee.org/document/6693716?tp=&arnumber=6693716}
     * @param {AbsolutePosition[]} points Points to triangulate
     * @param {number[]} angles Angles
     * @returns {Promise<AbsolutePosition>} Promise for the triangulated absolute position
     */
    protected triangulate<P extends AbsolutePosition>(points: P[], angles: number[]): Promise<P> {
        return new Promise<P>((resolve, reject) => {
            const vectors = [points[0].toVector3(), points[1].toVector3(), points[2].toVector3()];

            const x1 = vectors[0].x - vectors[1].x;
            const y1 = vectors[0].y - vectors[1].y;
            const x3 = vectors[2].x - vectors[1].x;
            const y3 = vectors[2].y - vectors[1].y;

            const t12 = 1 / Math.tan(angles[1] - angles[0]);
            const t23 = 1 / Math.tan(angles[2] - angles[1]);
            const t31 = (1 - t12 * t23) / (t12 + t23);

            const x12 = x1 + t12 * y1;
            const y12 = y1 - t12 * x1;
            const x23 = x3 - t23 * y3;
            const y23 = y3 + t23 * x3;
            const x31 = x3 + x1 + t31 * (y3 - y1);
            const y31 = y3 + y1 - t31 * (x3 - x1);

            const k31 = x1 * x3 + y1 * y3 + t31 * (x1 * y3 - x3 * y1);
            const d = (x12 - x23) * (y23 - y31) - (y12 - y23) * (x23 - x31);
            if (d === 0) {
                return reject(
                    new Error('Unable to triangulate: the three reference points and the object are concyclic'),
                );
            }
            const xr = vectors[1].x + (k31 * (y12 - y23)) / d;
            const yr = vectors[1].y + (k31 * (x23 - x12)) / d;
            // A RelativeAngle is a single azimuth, which constrains the object to a vertical
            // plane; any number of them intersect in a vertical line, so the angles carry no
            // altitude information at all. The best available estimate is the plane of the
            // reference points. Absolute2DPosition.fromVector ignores z, so 2D output is
            // unchanged; 3D and geographical positions keep their altitude instead of being
            // silently flattened to zero.
            const zr = (vectors[0].z + vectors[1].z + vectors[2].z) / 3;

            const point = points[0].clone();
            point.unit = points[0].unit;
            point.fromVector(new Vector3(xr, yr, zr));
            return resolve(point as P);
        });
    }
}

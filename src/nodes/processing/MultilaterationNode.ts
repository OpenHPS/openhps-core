import { AbsolutePosition, DataObject, GeographicalPosition, RelativeDistancePosition } from '../../data';
import { DataFrame } from '../../data/DataFrame';
import { AngleUnit } from '../../utils';
import { Vector3 } from '../../utils/math';
import { ObjectProcessingNodeOptions } from '../ObjectProcessingNode';
import { RelativePositionProcessing } from './RelativePositionProcessing';
import { nelderMead } from 'fmin';

/**
 * Multilateration processing node
 *
 * @category Processing node
 */
export class MultilaterationNode<InOut extends DataFrame> extends RelativePositionProcessing<
    InOut,
    RelativeDistancePosition
> {
    protected options: MultilaterationOptions;

    constructor(options?: MultilaterationOptions) {
        super(RelativeDistancePosition, options);
        this.options.incrementStep = this.options.incrementStep || 1;
    }

    public processRelativePositions<P extends AbsolutePosition>(
        dataObject: DataObject,
        relativePositions: Map<RelativeDistancePosition, DataObject>,
    ): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            let spheres: Array<Sphere<P>> = [];
            relativePositions.forEach((object, relativePosition) => {
                if (object.getPosition()) {
                    spheres.push(new Sphere(object.getPosition() as P, relativePosition.distance));
                }
            });

            // Order points and distances by distances
            spheres = spheres.sort((a, b) => a.radius - b.radius);

            let position: P;
            switch (spheres.length) {
                case 0:
                    return resolve(dataObject);
                case 1:
                    position = spheres[0].position.clone() as P;
                    position.accuracy = spheres[0].radius;
                    dataObject.setPosition(position);
                    return resolve(dataObject);
                case 2:
                    if (spheres[0].position instanceof GeographicalPosition) {
                        position = this.midpointGeographical(
                            spheres[0] as Sphere<any>,
                            spheres[1] as Sphere<any>,
                        ) as any;
                    } else {
                        position = this.midpoint(spheres[0], spheres[1]) as P;
                    }
                    dataObject.setPosition(position);
                    return resolve(dataObject);
                case 3:
                    this.trilaterate(spheres)
                        .then((position) => {
                            if (position) dataObject.setPosition(position);
                            resolve(dataObject);
                        })
                        .catch(reject);
                    break;
                default:
                    position = this.nls(spheres) as P;
                    dataObject.setPosition(position);
                    resolve(dataObject);
            }
        });
    }

    protected nls(spheres: Array<Sphere<any>>): AbsolutePosition {
        const coord = nelderMead(
            (point: number[]) => this._calculateError(point, spheres),
            this._calculateInit(spheres),
            { maxIterations: this.options.maxIterations },
        ).x;
        const position = spheres[0].position.clone();
        position.fromVector(new Vector3(...coord));
        return position;
    }

    /**
     * Midpoint to another location
     *
     * @param {Sphere<any>} sphereA sphere A
     * @param {Sphere<any>} sphereB sphere B
     * @returns {AbsolutePosition} Calculated midpoint
     */
    protected midpoint<P extends AbsolutePosition>(sphereA: Sphere<P>, sphereB: Sphere<P>): P {
        const pointA: P = sphereA.position;
        const pointB: P = sphereB.position;
        const newPoint: P = pointA.clone();
        newPoint.accuracy = pointA.accuracy + pointB.accuracy / 2;
        newPoint.fromVector(
            pointA
                .toVector3()
                .multiplyScalar(sphereA.radius)
                .add(pointB.toVector3().multiplyScalar(sphereB.radius))
                .divideScalar(sphereA.radius + sphereB.radius),
        );
        return newPoint;
    }

    /**
     * Get the midpoint of two geographical locations
     *
     * @param {Sphere<GeographicalPosition>} sphereA First position to get midpoint from
     * @param {Sphere<GeographicalPosition>} sphereB Other position to get midpoint from
     * @returns {GeographicalPosition} Calculated midpoint
     */
    protected midpointGeographical(
        sphereA: Sphere<GeographicalPosition>,
        sphereB: Sphere<GeographicalPosition>,
    ): GeographicalPosition {
        const pointA = sphereA.position;
        const pointB = sphereB.position;
        if (sphereA.radius === sphereB.radius) {
            const lonRadA = AngleUnit.DEGREE.convert(pointA.longitude, AngleUnit.RADIAN);
            const latRadA = AngleUnit.DEGREE.convert(pointA.latitude, AngleUnit.RADIAN);
            const lonRadB = AngleUnit.DEGREE.convert(pointB.longitude, AngleUnit.RADIAN);
            const latRadB = AngleUnit.DEGREE.convert(pointB.latitude, AngleUnit.RADIAN);

            const Bx = Math.cos(latRadB) * Math.cos(lonRadB - lonRadA);
            const By = Math.cos(latRadB) * Math.sin(lonRadB - lonRadA);
            const latX = Math.atan2(
                Math.sin(latRadA) + Math.sin(latRadB),
                Math.sqrt((Math.cos(latRadA) + Bx) * (Math.cos(latRadA) + Bx) + By * By),
            );
            const lonX = lonRadA + Math.atan2(By, Math.cos(latRadA) + Bx);

            const position = new GeographicalPosition();
            position.latitude = AngleUnit.RADIAN.convert(latX, AngleUnit.DEGREE);
            position.longitude = AngleUnit.RADIAN.convert(lonX, AngleUnit.DEGREE);
            return position;
        } else {
            // Calculate bearings
            const bearingAB = pointA.bearing(pointB);
            const bearingBA = pointB.bearing(pointA);
            // Calculate two reference points
            const C = pointA.destination(bearingAB, sphereA.radius);
            const D = pointB.destination(bearingBA, sphereB.radius);
            // Calculate the middle of C and D
            const midpoint = this.midpoint(new Sphere(C, 1), new Sphere(D, 1));
            midpoint.accuracy = Math.round((C.distanceTo(D) / 2) * 100) / 100;
            return midpoint;
        }
    }

    protected trilaterate<P extends AbsolutePosition>(spheres: Array<Sphere<P>>): Promise<P> {
        return new Promise<P>((resolve) => {
            const maxIterations = this.options.maxIterations || 900;
            const v = spheres.map((p) => p.center);
            const ex = v[1].clone().sub(v[0]).clone().divideScalar(v[1].length());
            const i = ex.dot(v[2].clone().sub(v[0]));
            const a = v[2].clone().sub(v[0]).sub(ex.clone().multiplyScalar(i));
            const ey = a.clone().divideScalar(a.length());
            const ez = ex.clone().cross(ey);
            const d = v[1].clone().sub(v[0]).length();
            const j = ey.clone().dot(v[2].clone().sub(v[0]));

            // Calculate coordinates
            let AX = spheres[0].radius;
            let BX = spheres[1].radius;
            let CX = spheres[2].radius;

            let b = -1;
            let x = 0;
            let y = 0;
            let iteration = 0;
            do {
                x = (Math.pow(AX, 2) - Math.pow(BX, 2) + Math.pow(d, 2)) / (2 * d);
                y = (Math.pow(AX, 2) - Math.pow(CX, 2) + Math.pow(i, 2) + Math.pow(j, 2)) / (2 * j) - (i / j) * x;
                b = Math.pow(AX, 2) - Math.pow(x, 2) - Math.pow(y, 2);

                // Increase distances
                AX += this.options.incrementStep;
                BX += this.options.incrementStep;
                CX += this.options.incrementStep;
                iteration++;
            } while (b < 0 && iteration < maxIterations);
            const z = Math.sqrt(b);
            if (isNaN(z)) {
                return resolve(undefined);
            }

            const point = spheres[0].position.clone();
            point.fromVector(
                v[0].clone().add(ex.multiplyScalar(x)).add(ey.multiplyScalar(y)).add(ez.multiplyScalar(z)),
            );
            return resolve(point);
        });
    }

    private _calculateInit(spheres: Array<Sphere<any>>): number[] {
        // center coordinates of smallest circle
        const smallestSphere = spheres[0];

        // weighted centroid of all pnts
        const sumR = spheres.map((p) => p.radius).reduce((a, b) => a + b);
        const wCentroid = new Vector3(0, 0, 0);
        spheres.forEach((sphere) => {
            const weight = (sumR - sphere.radius) / ((spheres.length - 1) * sumR);
            wCentroid.add(sphere.center.clone().multiplyScalar(weight));
        });

        // pick weighted centroid if it's included within the smallest circle radius,
        // otherwise go as far in that direction as ~90% of the smallest radius allows
        const radRatio = Math.min(1, (smallestSphere.radius / smallestSphere.center.distanceTo(wCentroid)) * 0.9);
        const p0 = wCentroid.multiplyScalar(radRatio).add(smallestSphere.center.clone().multiplyScalar(1 - radRatio));
        return p0.toArray();
    }

    private _calculateError(point: number[], spheres: Array<Sphere<any>>): number {
        return spheres
            .map((sphere) => (new Vector3(...point).distanceTo(sphere.center) - sphere.radius) ** 2)
            .reduce((a, b) => a + b);
    }
}

class Sphere<P extends AbsolutePosition> {
    position: P;
    radius: number;

    constructor(position: P, radius: number) {
        this.position = position;
        this.radius = radius;
    }

    get center(): Vector3 {
        return this.position.toVector3();
    }
}

export interface MultilaterationOptions extends ObjectProcessingNodeOptions {
    /**
     * Maximum number of iterations
     */
    maxIterations?: number;
    /**
     * Incrementation step
     */
    incrementStep?: number;
}

import { AbsolutePosition, Accuracy1D, DataObject, GeographicalPosition, RelativeDistance } from '../../data';
import { DataFrame } from '../../data/DataFrame';
import { AngleUnit } from '../../utils';
import { Vector3 } from '../../utils/math';
import { ObjectProcessingNodeOptions } from '../ObjectProcessingNode';
import { RelativePositionProcessing } from './RelativePositionProcessing';

/**
 * Multilateration processing node
 *
 * @category Processing node
 */
export class MultilaterationNode<InOut extends DataFrame> extends RelativePositionProcessing<InOut, RelativeDistance> {
    protected options: MultilaterationOptions;

    constructor(options?: MultilaterationOptions) {
        super(RelativeDistance, options);
        this.options.incrementStep = this.options.incrementStep || 1;
        this.options.minReferences = this.options.minReferences || 1;
        this.options.nlsFunction = this.options.nlsFunction || this.nls.bind(this);
    }

    processRelativePositions<P extends AbsolutePosition>(
        dataObject: DataObject,
        relativePositions: Map<RelativeDistance, DataObject>,
        dataFrame: DataFrame,
    ): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            let spheres: Array<Sphere<P>> = [];
            relativePositions.forEach((object, relativePosition) => {
                if (object.getPosition()) {
                    spheres.push(
                        new Sphere(
                            object.getPosition() as P,
                            relativePosition.distance,
                            relativePosition.accuracy.valueOf(),
                        ),
                    );
                }
            });

            // Order points and distances by distances
            spheres = spheres.sort((a, b) => a.radius - b.radius);

            // Check if amount of references surpasses the threshold
            if (spheres.length < this.options.minReferences) {
                return resolve(dataObject);
            } else if (spheres.length > this.options.maxReferences) {
                spheres = spheres.splice(0, this.options.maxReferences);
            }

            let position: P;
            switch (spheres.length) {
                case 0:
                    return resolve(dataObject);
                case 1:
                    position = spheres[0].position.clone() as P;
                    position.timestamp = dataFrame.createdTimestamp;
                    // Accuracy is radius + accuracy of the position that we are using
                    position.accuracy = new Accuracy1D(
                        spheres[0].radius + position.accuracy.valueOf() + spheres[0].accuracy,
                    );
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
                    position.timestamp = dataFrame.createdTimestamp;
                    position.accuracy = new Accuracy1D(
                        spheres.map((s) => s.accuracy).reduce((a, b) => a.valueOf() + b.valueOf()) / spheres.length,
                    );
                    dataObject.setPosition(position);
                    return resolve(dataObject);
                case 3:
                    this.trilaterate(spheres)
                        .then((position) => {
                            if (position) {
                                position.timestamp = dataFrame.createdTimestamp;
                                position.accuracy = new Accuracy1D(
                                    spheres.map((s) => s.accuracy).reduce((a, b) => a.valueOf() + b.valueOf()) /
                                        spheres.length,
                                );
                                dataObject.setPosition(position);
                            }
                            resolve(dataObject);
                        })
                        .catch(reject);
                    break;
                default:
                    position = this.options.nlsFunction(spheres) as P;
                    position.timestamp = dataFrame.createdTimestamp;
                    position.accuracy = new Accuracy1D(
                        spheres.map((s) => s.accuracy).reduce((a, b) => a.valueOf() + b.valueOf()) / spheres.length,
                    );
                    dataObject.setPosition(position);
                    resolve(dataObject);
            }
        });
    }

    /**
     * Nonlinear least squares using nelder mead
     *
     * @see {@link https://github.com/benfred/fmin}
     * @author Ben Frederickson, Qingrong Ke
     * @param {Array<Sphere<any>>} spheres Spheres with position and radius
     * @returns {AbsolutePosition} Output position
     */
    protected nls(spheres: Array<Sphere<any>>): AbsolutePosition {
        // Initiailize parameters
        const f = (point: number[]) => this._calculateError(point, spheres);
        const x0 = this._calculateInit(spheres);
        const maxIterations = this.options.maxIterations;
        const nonZeroDelta = 1.05;
        const zeroDelta = 0.001;
        const minErrorDelta = 1e-6;
        const minTolerance = 1e-5;
        const rho = 1;
        const chi = 2;
        const psi = -0.5;
        const sigma = 0.5;
        let maxDiff = 0;

        // Initialize simplex
        const N = x0.length;
        const simplex = new Array(N + 1);
        simplex[0] = x0;
        simplex[0].fx = f(x0);
        simplex[0].id = 0;
        for (let i = 0; i < N; ++i) {
            const point = x0.slice();
            point[i] = point[i] ? point[i] * nonZeroDelta : zeroDelta;
            simplex[i + 1] = point;
            simplex[i + 1].fx = f(point);
            simplex[i + 1].id = i + 1;
        }

        /**
         * @param {number} value Value
         */
        function updateSimplex(value) {
            for (let i = 0; i < value.length; i++) {
                simplex[N][i] = value[i];
            }
            simplex[N].fx = value.fx;
        }

        /**
         * @param {number[]} ret Return value
         * @param {number} w1 Weight 1
         * @param {number} v1 Value 1
         * @param {number} w2 Weight 2
         * @param {number} v2 Value 2
         */
        function weightedSum(ret, w1, v1, w2, v2) {
            for (let j = 0; j < ret.length; ++j) {
                ret[j] = w1 * v1[j] + w2 * v2[j];
            }
        }

        const sortOrder = (a, b) => a.fx - b.fx;

        const centroid = x0.slice() as number[] & { fx?: number };
        const reflected = x0.slice() as number[] & { fx?: number };
        const contracted = x0.slice() as number[] & { fx?: number };
        const expanded = x0.slice() as number[] & { fx?: number };

        for (let iteration = 0; iteration < maxIterations; ++iteration) {
            simplex.sort(sortOrder);

            maxDiff = 0;
            for (let i = 0; i < N; ++i) {
                maxDiff = Math.max(maxDiff, Math.abs(simplex[0][i] - simplex[1][i]));
            }

            if (Math.abs(simplex[0].fx - simplex[N].fx) < minErrorDelta && maxDiff < minTolerance) {
                break;
            }

            // compute the centroid of all but the worst point in the simplex
            for (let i = 0; i < N; ++i) {
                centroid[i] = 0;
                for (let j = 0; j < N; ++j) {
                    centroid[i] += simplex[j][i];
                }
                centroid[i] /= N;
            }

            // reflect the worst point past the centroid and compute loss at reflected
            // point
            const worst = simplex[N];
            weightedSum(reflected, 1 + rho, centroid, -rho, worst);
            reflected.fx = f(reflected);

            // if the reflected point is the best seen, then possibly expand
            if (reflected.fx < simplex[0].fx) {
                weightedSum(expanded, 1 + chi, centroid, -chi, worst);
                expanded.fx = f(expanded);
                if (expanded.fx < reflected.fx) {
                    updateSimplex(expanded);
                } else {
                    updateSimplex(reflected);
                }
            }

            // if the reflected point is worse than the second worst, we need to
            // contract
            else if (reflected.fx >= simplex[N - 1].fx) {
                let shouldReduce = false;

                if (reflected.fx > worst.fx) {
                    // do an inside contraction
                    weightedSum(contracted, 1 + psi, centroid, -psi, worst);
                    contracted.fx = f(contracted);
                    if (contracted.fx < worst.fx) {
                        updateSimplex(contracted);
                    } else {
                        shouldReduce = true;
                    }
                } else {
                    // do an outside contraction
                    weightedSum(contracted, 1 - psi * rho, centroid, psi * rho, worst);
                    contracted.fx = f(contracted);
                    if (contracted.fx < reflected.fx) {
                        updateSimplex(contracted);
                    } else {
                        shouldReduce = true;
                    }
                }

                if (shouldReduce) {
                    // if we don't contract here, we're done
                    if (sigma >= 1) break;

                    // do a reduction
                    for (let i = 1; i < simplex.length; ++i) {
                        weightedSum(simplex[i], 1 - sigma, simplex[0], sigma, simplex[i]);
                        simplex[i].fx = f(simplex[i]);
                    }
                }
            } else {
                updateSimplex(reflected);
            }
        }

        simplex.sort(sortOrder);

        const position = spheres[0].position.clone();
        position.fromVector(new Vector3(...simplex[0]));
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
            const midpoint = this.midpoint(
                new Sphere(C, 1, C.accuracy.valueOf()),
                new Sphere(D, 1, D.accuracy.valueOf()),
            );
            midpoint.accuracy = new Accuracy1D(Math.round((C.distanceTo(D) / 2) * 100) / 100);
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
    accuracy: number;

    constructor(position: P, radius: number, accuracy: number) {
        this.position = position;
        this.radius = radius;
        this.accuracy = accuracy;
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
    /**
     * Minimum amount of references
     *
     * @default 1
     */
    minReferences?: number;
    /**
     * Maximum amount of references
     *
     * @default undefined
     */
    maxReferences?: number;
    /**
     * Nonlinear Least Squares function
     *
     * @default nelder-mead
     */
    nlsFunction?: (spheres: Array<Sphere<any>>) => AbsolutePosition;
}

import { SerializableObject, SerializableMember } from "../decorators";
import { LengthUnit, Vector3, Quaternion } from "../../utils";
import { AbsolutePosition } from "./AbsolutePosition";
import { Velocity } from "./Velocity";
import { DataSerializer } from "../DataSerializer";

/**
 * Absolute cartesian 3D position. This class extends a [[Vector3]]. This location can be used both as
 * an absolute location or relative location.
 */
@SerializableObject()
export class Absolute3DPosition extends Vector3 implements AbsolutePosition {
    private _timestamp: number = new Date().getTime();
    private _velocity: Velocity = new Velocity();
    private _orientation: Quaternion = new Quaternion();
    private _unit: LengthUnit = LengthUnit.POINTS;
    private _referenceSpaceUID: string;
    private _accuracy: number;
    private _accuracyUnit: LengthUnit = LengthUnit.POINTS;
    
    /**
     * Position recording timestamp
     */
    @SerializableMember()
    public get timestamp(): number {
        return this._timestamp;
    }

    public set timestamp(timestamp: number) {
        this._timestamp = timestamp;
    }

    /**
     * Position accuracy
     */
    @SerializableMember()
    public get accuracy(): number {
        return this._accuracy;
    }

    public set accuracy(accuracy: number) {
        this._accuracy = accuracy;
    }
    
    public get accuracyUnit(): LengthUnit {
        return this._accuracyUnit;
    }

    public set accuracyUnit(accuracyUnit: LengthUnit) {
        this._accuracyUnit = accuracyUnit;
    }

    /**
     * Position reference space UID
     */
    @SerializableMember()
    public get referenceSpaceUID(): string {
        return this._referenceSpaceUID;
    }

    public set referenceSpaceUID(referenceSpaceUID: string) {
        this._referenceSpaceUID = referenceSpaceUID;
    }

    /**
     * Velocity at recorded position
     */
    @SerializableMember()
    public get velocity(): Velocity {
        return this._velocity;
    }

    public set velocity(velocity: Velocity) {
        this._velocity = velocity;
    }

    /**
     * Orientation at recorded position
     */
    @SerializableMember()
    public get orientation(): Quaternion {
        return this._orientation;
    }

    public set orientation(orientation: Quaternion) {
        this._orientation = orientation;
    }

    /**
     * Position unit
     */
    @SerializableMember()
    public get unit(): LengthUnit {
        return this._unit;
    }

    public set unit(unit: LengthUnit) {
        this._unit = unit;
    }

    /**
     * Midpoint to another location
     * @param otherPosition Other location
     */
    public midpoint(otherPosition: Absolute3DPosition, distanceSelf: number = 1, distanceOther: number = 1): Promise<Absolute3DPosition> {
        return new Promise<Absolute3DPosition>((resolve, reject) => {
            const newPoint = new Absolute3DPosition();
            newPoint.accuracy = this.accuracy + otherPosition.accuracy / 2;
            newPoint.set((this.x + otherPosition.x) / 2, (this.y + otherPosition.y) / 2, (this.z + otherPosition.z) / 2);
            resolve(newPoint);
        });
    }

    public static trilaterate(points: Absolute3DPosition[], distances: number[]): Promise<Absolute3DPosition> {
        return new Promise<Absolute3DPosition>((resolve, reject) => {
            switch (points.length) {
                case 0:
                    return resolve(null);
                case 1:
                    return resolve(points[0]);
                case 2:
                    return resolve(points[0].midpoint(points[1], distances[0], distances[1]));
                case 3:
                default:
                    const vectors = [
                        points[0].toVector3(),
                        points[1].toVector3(),
                        points[2].toVector3()
                    ];
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
                        y = ((Math.pow(AX, 2) - Math.pow(CX, 2) + Math.pow(i, 2) + Math.pow(j, 2)) / (2 * j)) - ((i / j) * x);
                        b = Math.pow(AX, 2) - Math.pow(x, 2) - Math.pow(y, 2);

                        // Increase distances
                        AX += 0.10;
                        BX += 0.10;
                        CX += 0.10;
                    } while (b < 0);
                    const z = Math.sqrt(b);
                    if (isNaN(z)) {
                        return resolve(null);
                    }
            
                    const point = new Absolute3DPosition();
                    point.unit = points[0].unit;
                    point.fromVector(vectors[0].clone().add(eX.multiplyScalar(x)).add(eY.multiplyScalar(y)).add(eZ.multiplyScalar(z)));
                    return resolve(point);
            }
        });
    }

    /**
     * Triangulate a cartesian 3d location
     * 
     * @source https://ieeexplore.ieee.org/document/6693716?tp=&arnumber=6693716
     * @param points 
     * @param angles 
     */
    public static triangulate(points: Absolute3DPosition[], angles: number[]): Promise<Absolute3DPosition> {
        return new Promise<Absolute3DPosition>((resolve, reject) => {
            const x1 = points[0].x - points[1].x;
            const y1 = points[0].y - points[1].y;
            const x3 = points[2].x - points[1].x;
            const y3 = points[2].y - points[1].y;
    
            const t12 = 1 / Math.tan(angles[1] - angles[0]);
            const t23 = 1 / Math.tan(angles[2] - angles[1]);
            const t31 = (1 - t12 * t23) / (t12 + t23);
            
            const x12 = x1 + t12 * y1;
            const y12 = y1 - t12 * x1;
            const x23 = x3 - t23 * y3;
            const y23 = y3 + t23 * x3;
            const x31 = (x3 + x1) + t31 * (y3 - y1);
            const y31 = (y3 + y1) - t31 * (x3 - x1);
    
            const k31 = x1 * x3 + y1 * y3 + t31 * (x1 * y3 - x3 * y1);
            const d = (x12 - x23) * (y23 - y31) - (y12 - y23) * (x23 - x31);
            if (d === 0) {
                return reject();
            }
            const xr = points[1].x + ((k31 * (y12 - y23)) / d);
            const yr = points[1].y + ((k31 * (x23 - x12)) / d);
            resolve(new Absolute3DPosition(xr, yr));
        });
    }

    public distance(other: Absolute3DPosition): number {
        return Math.pow(Math.pow((other.x - this.x), 2) + Math.pow((other.y - this.y), 2) + Math.pow((other.z - this.z), 2), 1 / 2.);
    }

    public fromVector(vector: Vector3, unit?: LengthUnit): void {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;

        if (unit !== undefined)
            this.unit = unit;
    }

    public toVector3(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    public equals(position: Absolute3DPosition): boolean {
        return this.toVector3().equals(position.toVector3());
    }

    /**
     * Clone the position
     */
    public clone(): this {
        const serialized = DataSerializer.serialize(this);
        const clone = DataSerializer.deserialize(serialized) as this;
        return clone;
    }

}

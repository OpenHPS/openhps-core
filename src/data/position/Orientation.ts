import { SerializableObject } from "../decorators";
import { Quaternion, EulerRotation, EulerOrder, AngleUnit } from "../../utils";

/**
 * Orientation rotation matrix
 */
@SerializableObject()
export class Orientation extends Array<number[]> {

    constructor(rotationMatrix?: number[][]) {
        super();
        if (rotationMatrix === undefined) {
            this[0] = [1, 0, 0, 0];
            this[1] = [0, 1, 0, 0];
            this[2] = [0, 0, 1, 0];
            this[3] = [0, 0, 0, 1];
        } else {
            this[0] = rotationMatrix[0];
            this[1] = rotationMatrix[1];
            this[2] = rotationMatrix[2];
            this[3] = rotationMatrix[3];
        }
    }

    /**
     * Create an orientation based on a quaternion
     * @param quaternion Quaternion
     */
    public static fromQuaternion(quaternion: number[]): Orientation;
    public static fromQuaternion(quaternion: Quaternion): Orientation;
    public static fromQuaternion(quaternion: any): Orientation {
        const orientation = new Orientation();
        let rotationMatrix: number[][] = orientation;

        if (quaternion instanceof Quaternion) {
            rotationMatrix = quaternion.toRotationMatrix();
        } else if (quaternion instanceof Array) {
            rotationMatrix = new Quaternion(quaternion[0], quaternion[1], quaternion[2], quaternion[3]).toRotationMatrix();
        }

        orientation[0] = rotationMatrix[0];
        orientation[1] = rotationMatrix[1];
        orientation[2] = rotationMatrix[2];
        orientation[3] = rotationMatrix[3];

        return orientation;
    }

    public static fromEulerRotation(rotation: { x: number, y: number, z: number, order?: EulerOrder, unit?: AngleUnit }): Orientation;
    public static fromEulerRotation(rotation: EulerRotation): Orientation;
    public static fromEulerRotation(rotation: any): Orientation {
        const orientation = new Orientation();
        const rotationMatrix: number[][] = rotation instanceof EulerRotation ? rotation.toRotationMatrix() : 
            new EulerRotation(rotation.x, rotation.y, rotation.z, rotation.order ? rotation.order : EulerOrder.XYZ, rotation.unit ? rotation.unit : AngleUnit.RADIANS).toRotationMatrix();

        orientation[0] = rotationMatrix[0];
        orientation[1] = rotationMatrix[1];
        orientation[2] = rotationMatrix[2];
        orientation[3] = rotationMatrix[3];

        return orientation;
    }

    /**
     * Convert orientation to quaternion
     */
    public toQuaternion(): Quaternion {
        return Quaternion.fromRotationMatrix(this);
    }

    /**
     * Convert orientation to euler rotation
     */
    public toEulerRotation(): EulerRotation {
        return EulerRotation.fromRotationMatrix(this);
    }

}

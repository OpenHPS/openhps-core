import { SerializableObject, SerializableMember } from "../decorators";
import { Quaternion, EulerRotation, EulerOrder, AngleUnit, AxisRotation } from "../../utils";

/**
 * Orientation rotation matrix
 */
@SerializableObject()
export class Orientation extends Array<number[]> {
    private _quaternion: Quaternion;

    constructor(rotationMatrix?: number[][]) {
        super();

        if (rotationMatrix === undefined || !Array.isArray(rotationMatrix)) {
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

        this._quaternion = Quaternion.fromRotationMatrix(this);
    }

    @SerializableMember()
    protected get quaternion(): Quaternion {
        return this._quaternion;
    }

    protected set quaternion(quat: Quaternion) {
        this._quaternion = quat;
        const rotationMatrix = quat.toRotationMatrix();
        this[0] = rotationMatrix[0];
        this[1] = rotationMatrix[1];
        this[2] = rotationMatrix[2];
        this[3] = rotationMatrix[3];
    }

    /**
     * Create an orientation based on a quaternion
     * @param quaternion Quaternion
     */
    public static fromQuaternion(quaternion: number[]): Orientation;
    public static fromQuaternion(quaternion: Quaternion): Orientation;
    public static fromQuaternion(quaternion: any): Orientation {
        const orientation = new Orientation();

        if (quaternion instanceof Quaternion) {
            orientation.quaternion = quaternion;
        } else if (quaternion instanceof Array) {
            orientation.quaternion = new Quaternion(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
        }

        return orientation;
    }

    /**
     * Create an orientation based on euler angles
     * @param rotation Euler angles
     */
    public static fromEulerRotation(rotation: { x: number, y: number, z: number, order?: EulerOrder, unit?: AngleUnit }): Orientation;
    public static fromEulerRotation(rotation: number[]): Orientation;
    public static fromEulerRotation(rotation: EulerRotation): Orientation;
    public static fromEulerRotation(rotation: any): Orientation {
        const orientation = new Orientation();
        let rotationMatrix: number[][];
        
        if (rotation instanceof EulerRotation) {
            rotationMatrix = rotation.toRotationMatrix();
        } else if (rotation instanceof Array) {
            rotationMatrix = new EulerRotation(rotation[0], rotation[1], rotation[2]).toRotationMatrix();
        } else {
            rotationMatrix = new EulerRotation(rotation.x, rotation.y, rotation.z, rotation.order ? rotation.order : 'XYZ', rotation.unit ? rotation.unit : AngleUnit.RADIANS).toRotationMatrix();
        }

        orientation.quaternion = Quaternion.fromRotationMatrix(rotationMatrix);
        return orientation;
    }

    /**
     * Create an orientation based on axis angles
     * @param rotation axis angles
     */
    public static fromAxisRotation(rotation: { x: number, y: number, z: number, angle: number, unit?: AngleUnit }): Orientation;
    public static fromAxisRotation(rotation: number[]): Orientation;
    public static fromAxisRotation(rotation: AxisRotation): Orientation;
    public static fromAxisRotation(rotation: any): Orientation {
        const orientation = new Orientation();

        if (rotation instanceof AxisRotation) {
            orientation.quaternion = Quaternion.fromAxisRotation(rotation);
        } else if (rotation instanceof Array) {
            orientation.quaternion = Quaternion.fromAxisRotation(new AxisRotation(rotation[0], rotation[1], rotation[2], rotation[3]));
        } else {
            orientation.quaternion = Quaternion.fromAxisRotation(new AxisRotation(rotation.x, rotation.y, rotation.z, rotation.angle, rotation.unit ? rotation.unit : AngleUnit.RADIANS));
        }

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

    /**
     * Convert orientation to rotation matrix
     */
    public toRotationMatrix(): number[][] {
        return this;
    }

    /**
     * Convert orientation to axis rotation
     */
    public toAxisRotation(): AxisRotation {
        return null;
    }

}

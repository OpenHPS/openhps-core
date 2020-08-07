import { SerializableObject } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Matrix4
 */
@SerializableObject()
export class Matrix4 extends THREE.Matrix4 {

    public static round(value: Matrix4, decimals: number = 0): Matrix4 {
        const pow = Math.pow(10, decimals);
        value.elements.forEach((e, i) => {
            value.elements[i] = Math.round(e * pow) / pow;
        });
        return value;
    }
    
    /**
     * Create a matrix from array
     * @param array Array
     */
    public static fromArray(array: number[][]): Matrix4 {
        const matrix = new Matrix4();
        matrix.fromArray([].concat(...array));
        matrix.transpose();
        return matrix;
    }

    /**
     * Create a rotation matrix from quaternion
     * @param quat Quaternion
     */
    public static rotationFromQuaternion(quat: THREE.Quaternion): Matrix4 {
        const matrix = new Matrix4();
        matrix.makeRotationFromQuaternion(quat);
        return matrix;
    }

    /**
     * Create a rotation matrix from euler angles
     * @param euler Euler angles
     */
    public static rotationFromEuler(euler: THREE.Euler): Matrix4 {
        const matrix = new Matrix4();
        matrix.makeRotationFromQuaternion(new THREE.Quaternion().setFromEuler(euler));
        return matrix;
    }

    /**
     * Create a rotation matrix from euler angles
     * @param vector Vector
     * @param angle Angle
     */
    public static rotationFromAxisAngle(vector: THREE.Vector3, angle: number): Matrix4 {
        const matrix = new Matrix4();
        matrix.makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(vector, angle));
        return matrix;
    }

}

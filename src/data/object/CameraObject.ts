import { SerializableObject, SerializableMember } from '../decorators';
import { DataObject } from './DataObject';
import { Matrix4 } from '../../utils';
import { Absolute2DPosition } from '../position/Absolute2DPosition';
import { Absolute3DPosition } from '../position/Absolute3DPosition';

/**
 * Camera source object
 */
@SerializableObject()
export class CameraObject extends DataObject {
    /**
     * This is the inverse of matrixWorld. MatrixWorld contains the Matrix which has the world transform of the Camera.
     */
    @SerializableMember()
    public matrixWorldInverse: Matrix4;

    /**
     * This is the matrix which contains the projection.
     */
    @SerializableMember()
    public projectionMatrix: Matrix4;

    /**
     * This is the inverse of projectionMatrix.
     */
    @SerializableMember()
    public projectionMatrixInverse: Matrix4;

    /**
     * Transform a 3d position to a 2d position shown by the camera
     *
     * @param {Absolute3DPosition} position 3D position
     * @returns {Absolute2DPosition} Transformed position
     */
    public transform(position: Absolute3DPosition): Absolute2DPosition {
        return position as any;
    }

    /**
     * Transform a 2d position to a 3d position through the camera
     *
     * @param {Absolute2DPosition} position 2D position
     * @returns {Absolute3DPosition} Transformed position
     */
    public inverseTransform(position: Absolute2DPosition): Absolute3DPosition {
        return position as any;
    }
}

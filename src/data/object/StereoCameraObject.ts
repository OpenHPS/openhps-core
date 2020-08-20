import { CameraObject } from './CameraObject';
import { SerializableObject, SerializableMember } from '../decorators';
import { DataObject } from './DataObject';

@SerializableObject()
export class StereoCameraObject extends DataObject {
    @SerializableMember()
    public leftCamera: CameraObject;
    @SerializableMember()
    public rightCamera: CameraObject;

    constructor(left?: CameraObject, right?: CameraObject) {
        super();
        this.leftCamera = left;
        this.rightCamera = right;
        if (left !== undefined && right !== undefined) {
            this.uid = left.uid + right.uid;
        }
    }
}

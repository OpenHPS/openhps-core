import { DataObject, DataFrame, RelativeAnglePosition, GeographicalPosition, Absolute2DPosition, Absolute3DPosition } from "../../data";
import { AngleUnit } from "../../utils";
import { RelativePositionProcessing } from "./RelativePositionProcessing";

/**
 * Triangulation processing node
 * Supported position types:
 * - [[Absolute2DPosition]]
 * - [[Absolute3DPosition]]
 * - [[GeographicalPosition]]
 */
export class TriangulationNode<InOut extends DataFrame> extends RelativePositionProcessing<InOut, RelativeAnglePosition> {

    constructor(filterFn?: (object: DataObject, frame?: InOut) => boolean) {
        super(RelativeAnglePosition, filterFn);
    }

    public processRelativePositions(dataObject: DataObject, relativePositions: Map<RelativeAnglePosition, DataObject>): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const objects = new Array<DataObject>();
            const points = new Array();
            const angles = new Array();
            relativePositions.forEach((object, relativePosition) => {
                if (object.getPosition()) {
                    objects.push(object);
                    points.push(object.getPosition());
                    angles.push(relativePosition.angleUnit.convert(relativePosition.angle, AngleUnit.RADIAN));
                }
            });

            switch (objects.length) {
                case 0:
                case 1:
                    return resolve(dataObject);
                case 2:
                    break;
                case 3:
                    switch (true) {
                        case objects[0].getPosition() instanceof Absolute3DPosition:
                            break;
                        case objects[0].getPosition() instanceof Absolute2DPosition:
                            Absolute2DPosition.triangulate(points, angles).then(position => {
                                if (position !== null)
                                    dataObject.setPosition(position);
                                resolve(dataObject);
                            }).catch(ex => {
                                reject(ex);
                            });
                            break;
                        case objects[0].getPosition() instanceof GeographicalPosition:
                            break;
                        default:
                            resolve(dataObject);
                    }
                    break;
                default:
                    return resolve(dataObject);
            }
        });
    }

}

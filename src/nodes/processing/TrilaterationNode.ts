import { 
    DataFrame, 
    DataObject, 
    RelativeDistancePosition, 
    Absolute3DPosition, 
    Absolute2DPosition, 
    GeographicalPosition 
} from "../../data";
import { RelativePositionProcessing } from "./RelativePositionProcessing";

/**
 * Trillateration processing node
 * Supported location types:
 * - [[Absolute2DPosition]]
 * - [[Absolute3DPosition]]
 * - [[GeographicalPosition]]
 */
export class TrilaterationNode<InOut extends DataFrame> extends RelativePositionProcessing<InOut, RelativeDistancePosition> {

    constructor(filterFn?: (object: DataObject, frame?: InOut) => boolean) {
        super(RelativeDistancePosition, filterFn);
    }

    public processRelativePositions(dataObject: DataObject, relativePositions: Map<RelativeDistancePosition, DataObject>): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const objects = new Array<DataObject>();
            const points = new Array();
            const distances = new Array();
            relativePositions.forEach((object, relativePosition) => {
                if (object.getPosition()) {
                    objects.push(object);
                    points.push(object.getPosition());
                    distances.push(relativePosition.distance);
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
                            Absolute3DPosition.trilaterate(points, distances).then(location => {
                                if (location !== null)
                                    dataObject.setPosition(location);
                                resolve(dataObject);
                            }).catch(ex => {
                                reject(ex);
                            });
                            break;
                        case objects[0].getPosition() instanceof Absolute2DPosition:
                            Absolute2DPosition.trilaterate(points, distances).then(location => {
                                if (location !== null)
                                    dataObject.setPosition(location);
                                resolve(dataObject);
                            }).catch(ex => {
                                reject(ex);
                            });
                            break;
                        case objects[0].getPosition() instanceof GeographicalPosition:
                            GeographicalPosition.trilaterate(points, distances).then(location => {
                                if (location !== null)
                                    dataObject.setPosition(location);
                                resolve(dataObject);
                            }).catch(ex => {
                                reject(ex);
                            });
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

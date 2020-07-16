import { SensorObject, DataObject, DataFrame, RelativeAnglePosition, GeographicalPosition, Absolute2DPosition, Absolute3DPosition } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";
import { Model } from "../../Model";
import { AngleUnit } from "../../utils";

/**
 * Triangulation processing node
 * Supported position types:
 * - [[Absolute2DPosition]]
 * - [[Absolute3DPosition]]
 * - [[GeographicalPosition]]
 */
export class TriangulationNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    public processObject(dataObject: SensorObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const referencePromises = new Array();
            const index = new Map<string, RelativeAnglePosition[]>();
            for (const relativePosition of dataObject.relativePositions) {
                // Only use relative angle locations
                if (relativePosition instanceof RelativeAnglePosition) {
                    if (index.has(relativePosition.referenceObjectUID)) {
                        index.get(relativePosition.referenceObjectUID).push(relativePosition);
                    } else {
                        index.set(relativePosition.referenceObjectUID, [relativePosition]);
                    }
                    referencePromises.push(this._findObjectByName(relativePosition.referenceObjectUID, relativePosition.referenceObjectType, dataFrame));
                }
            }

            Promise.all(referencePromises).then(referenceObjects => {
                // Filter relative locations that have an absolute location
                const filteredRelativePositions = new Array<RelativeAnglePosition>();
                const objectCache = new Map<string, DataObject>();
                referenceObjects.forEach((referenceObject: DataObject) => {
                    if (referenceObject.currentPosition !== undefined) {
                        objectCache.set(referenceObject.uid, referenceObject);
                        index.get(referenceObject.uid).forEach(relativePosition => {
                            filteredRelativePositions.push(relativePosition);
                        });
                    }
                });

                const objects = new Array<DataObject>();
                const points = new Array();
                const angles = new Array();
                filteredRelativePositions.forEach(filteredRelativePosition => {
                    const object = objectCache.get(filteredRelativePosition.referenceObjectUID);
                    objects.push(object);
                    points.push(object.currentPosition);
                    angles.push(filteredRelativePosition.angleUnit.convert(filteredRelativePosition.angle, AngleUnit.RADIANS));
                });

                switch (filteredRelativePositions.length) {
                    case 0:
                    case 1:
                        resolve(dataObject);
                        break;
                    case 2:
                        break;
                    case 3:
                        switch (true) {
                            case objects[0].currentPosition instanceof Absolute3DPosition:
                                break;
                            case objects[0].currentPosition instanceof Absolute2DPosition:
                                Absolute2DPosition.triangulate(points, angles).then(position => {
                                    if (position !== null)
                                        dataObject.currentPosition = position;
                                    resolve(dataObject);
                                }).catch(ex => {
                                    reject(ex);
                                });
                                break;
                            case objects[0].currentPosition instanceof GeographicalPosition:
                                break;
                            default:
                                resolve(dataObject);
                        }
                        break;
                    default:
                        break;
                }
            }).catch(ex => {
                reject(ex);
            }); 
        });
    }

    private _findObjectByName(uid: string, type: string, dataFrame: InOut): Promise<DataObject> {
        if (dataFrame.hasObject(new DataObject(uid))) {
            return new Promise<DataObject>((resolve, reject) => {
                resolve(dataFrame.getObjectByUID(uid));
            });
        }

        const model = (this.graph as Model<any, any>);
        const defaultService = model.findDataService(DataObject);
        if (type === undefined) {
            return defaultService.findByUID(uid);
        }
        const service = model.findDataServiceByName(type);
        if (service === undefined) {
            return defaultService.findByUID(uid);
        } else {
            return service.findByUID(uid);
        }
    }

}

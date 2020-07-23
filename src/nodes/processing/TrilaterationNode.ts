import { ObjectProcessingNode } from "../ObjectProcessingNode";
import { 
    DataFrame, 
    DataObject, 
    RelativeDistancePosition, 
    SensorObject, 
    Absolute3DPosition, 
    Absolute2DPosition, 
    GeographicalPosition 
} from "../../data";
import { Model } from "../../Model";

/**
 * Trillateration processing node
 * Supported location types:
 * - [[Absolute2DPosition]]
 * - [[Absolute3DPosition]]
 * - [[GeographicalPosition]]
 */
export class TrilaterationNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    public processObject(dataObject: SensorObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const referencePromises = new Array();
            const index = new Map<string, RelativeDistancePosition[]>();
            for (const relativePosition of dataObject.relativePositions) {
                // Only use relative distance locations
                if (relativePosition instanceof RelativeDistancePosition) {
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
                const filteredRelativePositions = new Array<RelativeDistancePosition>();
                const objectCache = new Map<string, DataObject>();
                referenceObjects.forEach((referenceObject: DataObject) => {
                    if (referenceObject.getPosition() !== undefined) {
                        objectCache.set(referenceObject.uid, referenceObject);
                        index.get(referenceObject.uid).forEach(relativePosition => {
                            filteredRelativePositions.push(relativePosition);
                        });
                    }
                });

                const objects = new Array<DataObject>();
                const points = new Array();
                const distances = new Array();
                filteredRelativePositions.forEach(filteredRelativePosition => {
                    const object = objectCache.get(filteredRelativePosition.referenceObjectUID);
                    objects.push(object);
                    points.push(object.getPosition());
                    distances.push(filteredRelativePosition.distance);
                });

                switch (filteredRelativePositions.length) {
                    case 0: // Unable to calculate absolute location
                        resolve(dataObject);
                        break;
                    case 1: // Use relative location + accuracy
                    case 2: // Midpoint of two locations
                    case 3: // Trilateration
                    default:
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

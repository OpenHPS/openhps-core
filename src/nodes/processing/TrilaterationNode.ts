import { ObjectProcessingNode } from "../ObjectProcessingNode";
import { 
    DataFrame, 
    DataObject, 
    RelativeDistanceLocation, 
    SensorObject, 
    Cartesian3DLocation, 
    Cartesian2DLocation, 
    GeographicalLocation 
} from "../../data";
import { Model } from "../../Model";

/**
 * Trillateration processing node
 * Supported location types:
 * - [[Cartesian2DLocation]]
 * - [[Cartesian3DLocation]]
 * - [[GeographicalLocation]]
 */
export class TrilaterationNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    public processObject(dataObject: SensorObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const referencePromises = new Array();
            const index = new Map<string, RelativeDistanceLocation[]>();
            for (const relativeLocation of dataObject.relativeLocations) {
                // Only use relative distance locations
                if (relativeLocation instanceof RelativeDistanceLocation) {
                    if (index.has(relativeLocation.referenceObjectUID)) {
                        index.get(relativeLocation.referenceObjectUID).push(relativeLocation);
                    } else {
                        index.set(relativeLocation.referenceObjectUID, [relativeLocation]);
                    }
                    referencePromises.push(this._findObjectByName(relativeLocation.referenceObjectUID, relativeLocation.referenceObjectType, dataFrame));
                }
            }

            Promise.all(referencePromises).then(referenceObjects => {
                // Filter relative locations that have an absolute location
                const filteredRelativeLocations = new Array<RelativeDistanceLocation>();
                const objectCache = new Map<string, DataObject>();
                referenceObjects.forEach((referenceObject: DataObject) => {
                    if (referenceObject.currentLocation !== undefined) {
                        objectCache.set(referenceObject.uid, referenceObject);
                        index.get(referenceObject.uid).forEach(relativeLocation => {
                            filteredRelativeLocations.push(relativeLocation);
                        });
                    }
                });

                const objects = new Array<DataObject>();
                const points = new Array();
                const distances = new Array();
                filteredRelativeLocations.forEach(filteredRelativeLocation => {
                    const object = objectCache.get(filteredRelativeLocation.referenceObjectUID);
                    objects.push(object);
                    points.push(object.currentLocation);
                    distances.push(filteredRelativeLocation.distance);
                });

                switch (filteredRelativeLocations.length) {
                    case 0: // Unable to calculate absolute location
                        resolve(dataObject);
                        break;
                    case 1: // Use relative location + accuracy
                    case 2: // Midpoint of two locations
                    case 3: // Trilateration
                    default:
                        switch (true) {
                            case objects[0].currentLocation instanceof Cartesian3DLocation:
                                Cartesian3DLocation.trilaterate(points, distances).then(location => {
                                    if (location !== null)
                                        dataObject.addPredictedLocation(location);
                                    resolve(dataObject);
                                }).catch(ex => {
                                    reject(ex);
                                });
                                break;
                            case objects[0].currentLocation instanceof Cartesian2DLocation:
                                Cartesian2DLocation.trilaterate(points, distances).then(location => {
                                    if (location !== null)
                                        dataObject.addPredictedLocation(location);
                                    resolve(dataObject);
                                }).catch(ex => {
                                    reject(ex);
                                });
                                break;
                            case objects[0].currentLocation instanceof GeographicalLocation:
                                GeographicalLocation.trilaterate(points, distances).then(location => {
                                    if (location !== null)
                                        dataObject.addPredictedLocation(location);
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

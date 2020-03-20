import { SensorObject, DataObject, DataFrame, RelativeAngleLocation, GeographicalLocation, Cartesian2DLocation, Cartesian3DLocation } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";
import { Model } from "../../Model";
import { AngleUnit } from "../../utils";

/**
 * Triangulation processing node
 * Supported location types:
 * - [[Cartesian2DLocation]]
 * - [[Cartesian3DLocation]]
 * - [[GeographicalLocation]]
 */
export class TriangulationNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    constructor(filter?: Array<new() => any>) {
        super(filter);
    }

    public processObject(dataObject: SensorObject, dataFrame: InOut): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const referencePromises = new Array();
            const index = new Map<string, RelativeAngleLocation[]>();
            for (const relativeLocation of dataObject.relativeLocations) {
                // Only use relative angle locations
                if (relativeLocation instanceof RelativeAngleLocation) {
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
                const filteredRelativeLocations = new Array<RelativeAngleLocation>();
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
                const angles = new Array();
                filteredRelativeLocations.forEach(filteredRelativeLocation => {
                    const object = objectCache.get(filteredRelativeLocation.referenceObjectUID);
                    objects.push(object);
                    points.push(object.currentLocation);
                    angles.push(filteredRelativeLocation.angleUnit.convert(filteredRelativeLocation.angle, AngleUnit.RADIANS));
                });

                switch (filteredRelativeLocations.length) {
                    case 0:
                    case 1:
                        resolve(dataObject);
                        break;
                    case 2:
                        break;
                    case 3:
                        switch (true) {
                            case objects[0].currentLocation instanceof Cartesian3DLocation:
                                break;
                            case objects[0].currentLocation instanceof Cartesian2DLocation:
                                Cartesian2DLocation.triangulate(points, angles).then(location => {
                                    if (location !== null)
                                        dataObject.addPredictedLocation(location);
                                    resolve(dataObject);
                                }).catch(ex => {
                                    reject(ex);
                                });
                                break;
                            case objects[0].currentLocation instanceof GeographicalLocation:
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

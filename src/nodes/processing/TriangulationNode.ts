import { SensorObject, DataObject, DataFrame, RelativeAngleLocation } from "../../data";
import { ObjectProcessingNode } from "../ObjectProcessingNode";
import { Model } from "../../Model";

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

    public processObject(dataObject: SensorObject): Promise<DataObject> {
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
                    referencePromises.push(this._findObjectByName(relativeLocation.referenceObjectUID, relativeLocation.referenceObjectType));
                }
            }

            Promise.all(referencePromises).then(referenceObjects => {
                // Filter relative locations that have an absolute location
                const filteredRelativeLocations = new Array<RelativeAngleLocation>();
                const objectCache = new Map<string, DataObject>();
                referenceObjects.forEach((referenceObject: DataObject) => {
                    if (referenceObject.absoluteLocation !== undefined) {
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
                    points.push(object.absoluteLocation);
                    angles.push(filteredRelativeLocation.angle);
                });

                switch (filteredRelativeLocations.length) {
                    
                }
            }).catch(ex => {
                reject(ex);
            }); 
        });
    }

    private _findObjectByName(uid: string, type: string): Promise<DataObject> {
        const model = (this.graph as Model<any, any>);
        const defaultService = model.findDataService(DataObject);
        if (type === undefined) {
            return defaultService.findById(uid);
        }
        const service = model.findDataServiceByName(type);
        if (service === undefined) {
            return defaultService.findById(uid);
        } else {
            return service.findById(uid);
        }
    }

}

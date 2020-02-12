import { SensorObject, DataObject, DataFrame } from "../../data";
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

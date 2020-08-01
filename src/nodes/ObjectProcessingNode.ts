import { DataFrame, DataObject } from "../data";
import { ProcessingNode } from "./ProcessingNode";
import { Model } from "../Model";

/**
 * Processing node that processes each [[DataObject]] in a [[DataFrame]] individually
 */
export abstract class ObjectProcessingNode<InOut extends DataFrame = DataFrame> extends ProcessingNode<InOut, InOut> {
    private _filterFn: (object: DataObject, frame?: InOut) => boolean = (object: DataObject) => true;

    constructor(filterFn?: (object: DataObject, frame?: InOut) => boolean) {
        super();

        if (filterFn !== undefined) {
            this._filterFn = filterFn;
        }
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const processObjectPromises = new Array();
            frame.getObjects().filter(value => this._filterFn(value, frame)).forEach(object => {
                processObjectPromises.push(this.processObject(object, frame));
            });
            Promise.all(processObjectPromises).then(objects => {
                objects.forEach(object => {
                    frame.addObject(object);
                });
                resolve(frame);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Process an individual data object
     * @param dataObject Data object to process
     * @param dataFrame Data frame this object belongs to
     */
    public abstract processObject(dataObject: DataObject, dataFrame?: InOut): Promise<DataObject>;

    /**
     * Find an object by its uid
     * @param uid 
     * @param dataFrame 
     * @param type 
     */
    protected findObjectByUID(uid: string, dataFrame?: InOut, type?: string): Promise<DataObject> {
        if (dataFrame !== undefined) {
            if (dataFrame.hasObject(new DataObject(uid))) {
                return new Promise<DataObject>((resolve, reject) => {
                    resolve(dataFrame.getObjectByUID(uid));
                });
            }
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

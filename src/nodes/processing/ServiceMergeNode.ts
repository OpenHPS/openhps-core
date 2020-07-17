import { DataFrame, DataObject } from "../../data";
import { ProcessingNode } from "../ProcessingNode";
import { Model } from "../../Model";

export class ServiceMergeNode<InOut extends DataFrame | DataFrame[]> extends ProcessingNode<InOut, InOut> {

    constructor() {
        super();
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const model = (this.graph as Model<any, any>);
            const defaultService = model.findDataService(DataObject);
            const promises = new Array();
            const objects = new Array<DataObject>();
            if (frame instanceof Array) {
                frame.forEach((f: DataFrame) => {
                    f.getObjects().forEach(object => {
                        objects.push(object);
                    });
                });
            } else {
                (frame as DataFrame).getObjects().forEach(object => {
                    objects.push(object);
                });
            }
            objects.forEach(object => {
                promises.push(new Promise((objResolve, objReject) => {
                    let service = model.findDataServiceByObject(object);
                    if (service === null || service === undefined) {
                        service = defaultService;
                    }
                    service.findByUID(object.uid).then(existingObject => {
                        if (existingObject === null) {
                            objResolve();
                        }

                        object.merge(existingObject);
                        objResolve();
                    }).catch(ex => {
                        // Ignore
                        objResolve();
                    });
                }));
            });
            
            Promise.all(promises).then(() => {
                resolve(frame);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

}

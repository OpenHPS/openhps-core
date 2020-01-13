import { DataFrame } from "../../data";
import { ProcessingNode } from "../ProcessingNode";
import { GraphPushOptions } from "../../graph";
import { Model } from "../../Model";

export class ServiceMergeNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {

    constructor() {
        super();
    }

    public process(data: InOut, options: GraphPushOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const model = (this.getGraph() as Model<any, any>);
            data.getObjects().forEach(object => {
                const service = model.getDataServiceByObject(object);
                service.findById(object.getUID()).then(existingObject => {
                    
                });
            });
        });
    }

}

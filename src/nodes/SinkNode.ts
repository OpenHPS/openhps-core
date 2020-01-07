import { Node } from "../Node";
import { GraphOptions } from "../utils/GraphOptions";
import { DataFrame } from "../data/DataFrame";
import { Model } from "../Model";

export abstract class SinkNode<In extends DataFrame> extends Node<In, In> {

    constructor() {
        super();
    }

    public push(data: In, options?: GraphOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.onPush(data, options);
            const servicePromises = new Array();
            for (const object of data.getObjects()) {
                const service = (this.getGraph() as Model<any, any>).getDataServiceByObject(object);
                if (object.getUID() !== null) {
                    servicePromises.push(service.update(object));
                } else {
                    servicePromises.push(service.create(object));
                }
            }
            if (servicePromises.length === 0) {
                resolve();
            } else {
                Promise.resolve(servicePromises).then(_ => {
                    resolve();
                });
            }
        });
    }

    public abstract onPush(data: In, options?: GraphOptions): void;

}

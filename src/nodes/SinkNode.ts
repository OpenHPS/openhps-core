import { DataFrame } from "../data/DataFrame";
import { Model } from "../Model";
import { DataObject } from "../data";
import { v4 as uuidv4 } from 'uuid';
import { AbstractSinkNode } from "../graph/interfaces/AbstractSinkNode";
import { DataService } from "../service";
import { NodeOptions } from "../Node";

/**
 * Sink node
 */
export abstract class SinkNode<In extends DataFrame = DataFrame> extends AbstractSinkNode<In> {
    public options: SinkNodeOptions;

    constructor(options?: SinkNodeOptions) {
        super(options);
    }

    public push(frame: In | In[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (frame === null || frame === undefined) {
                this.logger("warning", {
                    node: { uid: this.uid, name: this.name },
                    message: `Sink node received null data frame!`,
                });
                return reject();
            }

            // Push the frame to the sink node
            this.onPush(frame).then(() => {
                const persistPromise = new Array();
                if (frame instanceof Array) {
                    frame.forEach((f: In) => {
                        persistPromise.push(this.persistDataFrame(f));
                        persistPromise.push(this.persistDataObject(f));
                    });
                } else {
                    persistPromise.push(this.persistDataFrame(frame));
                    persistPromise.push(this.persistDataObject(frame));
                }
                return Promise.all(persistPromise);
            }).then(() => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    protected persistDataFrame(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const model: Model<any, any> = (this.graph as Model<any, any>);
            const servicePromises = new Array();

            // Remove the frame from the data frame service
            let frameService: DataService<any, any>;
            // Check if there are frame services
            frameService = model.findDataService(frame);
            if (frameService !== null && frameService !== undefined) { 
                // Update the frame
                servicePromises.push(frameService.delete(frame.uid));
            }

            Promise.all(servicePromises).then(() => {
                resolve();
            }).catch(() => {
                resolve(); // Ignore frame deleting issue
            });
        });
    }

    protected persistDataObject(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const model: Model<any, any> = (this.graph as Model<any, any>);
            const servicePromises = new Array();

            const objects = new Array<DataObject>();
            frame.getObjects().forEach(object => {
                objects.push(object);
            });

            for (const object of objects) {
                if (object.uid === null) {
                    object.uid = uuidv4();
                }
                // Queue the storage of the object in a data service
                servicePromises.push(model.findDataService(object).insert(object.uid, object));
            }

            Promise.all(servicePromises).then(() => resolve()).catch(reject);
        });
    }

    public abstract onPush(frame: In | In[]): Promise<void>;

}

export interface SinkNodeOptions extends NodeOptions {
    /**
     * Store objects in data services
     * @default true
     */
    persistence?: boolean;
}

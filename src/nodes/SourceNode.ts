import { DataFrame } from "../data/DataFrame";
import { DataObject } from "../data";
import { AbstractSourceNode } from "../graph/interfaces/AbstractSourceNode";
import { Model } from "../Model";

/**
 * Source node
 */
export abstract class SourceNode<Out extends DataFrame | DataFrame[] = DataFrame> extends AbstractSourceNode<Out> {
    private _source: DataObject;
    private _ignoreMerging: boolean;

    /**
     * Construct a new source node
     * 
     * @param ignoreMerging When set to true, the data frames will not be merged with
     * services 
     */
    constructor(source: DataObject, ignoreMerging: boolean = false) {
        super();
        this._source = source;
        
        this._ignoreMerging = ignoreMerging;
        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));
    }

    private _onPush(data: Out): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const servicePromises = new Array();
            const pushPromises = new Array();
            const model = (this.graph as Model);

            if (data instanceof Array) {
                data.forEach(async f => {
                    if (!this._ignoreMerging)
                        f = await this._mergeFrame(f);

                    if (f !== null || f !== undefined) {
                        const frameService = model.findDataService(f);
                        
                        if (frameService !== null && frameService !== undefined) { 
                            // Update the frame
                            servicePromises.push(frameService.insert(f.uid, f));
                        }
                    } else {
                        // No frame provided in pull
                        return resolve();
                    }
                });
            } else {
                if (data !== null || data !== undefined) {
                    let frame: DataFrame = data as DataFrame;

                    if (!this._ignoreMerging)
                        frame = await this._mergeFrame(frame);

                    const frameService = model.findDataService(frame);
                    
                    if (frameService !== null && frameService !== undefined) { 
                        // Update the frame
                        servicePromises.push(frameService.insert(frame.uid, frame as DataFrame));
                    }
                } else {
                    // No frame provided in pull
                    return resolve();
                }
            }
            
            this.outputNodes.forEach(node => {
                pushPromises.push(node.push(data));
            });
            
            Promise.all(pushPromises).then(() => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _mergeFrame(frame: DataFrame): Promise<DataFrame> {
        return new Promise<DataFrame>((resolve, reject) => {
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
                    let service = model.findDataService(object);
                    if (service === null || service === undefined) {
                        service = defaultService;
                    }
                    service.findByUID(object.uid).then((existingObject: DataObject) => {
                        if (existingObject === null) {
                            objResolve();
                        }

                        object.merge(existingObject);
                        objResolve();
                    }).catch(_ => {
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

    private _onPull(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.onPull().then(frame => {
                if (frame !== undefined && frame !== null) {
                    return this.push(frame);
                } else {
                    resolve();
                }
            }).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public get source(): DataObject {
        return this._source;
    }

    public set source(source: DataObject) {
        this._source = source;
    }

    public abstract onPull(): Promise<Out>;

}

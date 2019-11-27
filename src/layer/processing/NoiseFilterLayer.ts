import { DataFrame, DataObject } from "../../data";
import { DataOptions } from "../DataOptions";
import { ProcessingLayer } from "./ProcessingLayer";

/**
 * Noise filter processing layer. 
 */
export abstract class NoiseFilterLayer<In extends DataFrame, Out extends DataFrame> extends ProcessingLayer<In, Out> {
    private _defaultLayerData: any;

    constructor(defaultLayerData: any = {}) {
        super();
        this._defaultLayerData = defaultLayerData;
    }

    /**
     * Process the data that was pushed or pulled from this layer
     * @param data Data frame
     * @param options Push/Pull options
     */
    public process(data: In, options: DataOptions): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            const promises = new Array<PromiseLike<{object: DataObject, layerData: any}>>();
            data.getObjects().forEach(object => {
                let layerData = object.getLayerData(this.getUID());
                if (layerData === null) {
                    layerData = this._defaultLayerData;
                }
                promises.push(this.processObject(object, layerData));
            });
            Promise.all(promises).then(results => {

            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Process the data that was pushed or pulled from this layer
     * @param data Data frame
     * @param options Push/Pull options
     */
    public predict(data: In, options: DataOptions): Promise<Out> {
        // Predicting is the same as processing since the output layer decides on storing the data
        return this.process(data, options);
    }

    public abstract processObject(object: DataObject, layerData: any): Promise<{object: DataObject, layerData: any}>;

    public abstract predictObject(object: DataObject, layerData: any): Promise<{object: DataObject, layerData: any}>;
}

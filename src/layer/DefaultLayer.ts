import { Layer } from "./Layer";
import { DataFrame } from "../data/DataFrame";
import { PushOptions } from "./PushOptions";
import { PullOptions } from "./PullOptions";
import { LayerException } from "../exceptions";

export class DefaultLayer<T extends DataFrame, K extends DataFrame> extends Layer<T, K> {
    private _layer: Layer<any, any>;

    constructor(name: string = "default", layer?: Layer<any, any>) {
        super(name);
        this._layer = layer;
    }

    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public push(data: T, options: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            reject(new LayerException(this._layer, "No next layer configured!"));
        });
    }

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public pull(options: PullOptions): Promise<K> {
        return new Promise<K>((resolve, reject) => {
            reject(new LayerException(this._layer, "No previous layer configured!"));
        });
    }

}

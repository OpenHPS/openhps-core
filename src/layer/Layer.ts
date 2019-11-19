import { Model } from "../Model";
import { DataFrame } from "../data/DataFrame";
import { PullOptions } from "./PullOptions";
import { PushOptions } from "./PushOptions";

/**
 * # OpenHPS: Layer
 * General Layer of the OpenHPS [[Model]]
 */
export abstract class Layer<T extends DataFrame, K extends DataFrame> {
    private _name: string;
    private _model: Model<any,any>;
    private _prevLayer: Layer<any,T>;
    private _nextLayer: Layer<K,any>;

    /**
     * Create a new layer
     * @param name Layer name
     * @param flowType Layer in and out flow type
     */
    constructor(name: string = "default") {
        this._name = name;
    }

    /**
     * Push the data to the layer
     * @param data Input data
     * @param options Push options
     */
    public abstract push(data: T, options: PushOptions) : Promise<void>;

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public abstract pull(options: PullOptions) : Promise<K>;

    /**
     * Get layer name
     */
    public getName() : string {
        return this._name;
    }

    /**
     * Get model that the layer belongs to
     */
    public getModel(): Model<any,any> {
        return this._model;
    }

    /**
     * Set the model that the layer belongs to
     * @param model Model that the layer belongs to
     */
    public setModel(model: Model<any,any>) : void {
        this._model = model;
    }

    /**
     * Get previous layer
     */
    public getPreviousLayer() : Layer<any,T> {
        return this._prevLayer;
    }

    /**
     * Set the previous layer
     * @param prevLayer Previous layer
     */
    public setPreviousLayer(prevLayer: Layer<any,T>) : void {
        this._prevLayer = prevLayer;
    }

    /**
     * Get next layer
     */
    public getNextLayer() : Layer<K,any> {
        return this._nextLayer;
    }

    /**
     * Set the previous layer
     * @param prevLayer Previous layer
     */
    public setNextLayer(nextLayer: Layer<K,any>) : void {
        this._nextLayer = nextLayer;
    }
}
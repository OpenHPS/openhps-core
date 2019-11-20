import { DataFrame } from "../data/DataFrame";
import { PullOptions } from "./PullOptions";
import { PushOptions } from "./PushOptions";
import { LayerException } from "../exceptions";

/**
 * # OpenHPS: Layer
 * General Layer of the OpenHPS [[Model]]
 */
export abstract class Layer<T extends DataFrame, K extends DataFrame> {
    private _name: string;
    private _parent: LayerContainer<any, any>;
    private _prevLayer: Layer<any, T> = new DefaultLayer<any, T>();
    private _nextLayer: Layer<K, any> = new DefaultLayer<K, any>();

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
    public abstract push(data: T, options: PushOptions): Promise<void>;

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public abstract pull(options: PullOptions): Promise<K>;

    /**
     * Get layer name
     */
    public getName(): string {
        return this._name;
    }

    /**
     * Get parent layer that the layer belongs to
     */
    public getParent(): LayerContainer<any, any> {
        return this._parent;
    }

    /**
     * Set the parent layer that the layer belongs to
     * @param model Model that the layer belongs to
     */
    public setParent(parent: LayerContainer<any, any>): void {
        this._parent = parent;
    }

    /**
     * Get previous layer
     */
    public getPreviousLayer(): Layer<any, T> {
        return this._prevLayer;
    }

    /**
     * Set the previous layer
     * @param prevLayer Previous layer
     */
    public setPreviousLayer(prevLayer: Layer<any, T>): void {
        this._prevLayer = prevLayer;
    }

    /**
     * Get next layer
     */
    public getNextLayer(): Layer<K, any> {
        return this._nextLayer;
    }

    /**
     * Set the previous layer
     * @param prevLayer Previous layer
     */
    public setNextLayer(nextLayer: Layer<K, any>): void {
        this._nextLayer = nextLayer;
    }
}
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
            reject(new LayerException("No next layer configured!"));
        });
    }

    /**
     * Pull the data from the previous layer and process it
     * @param options Pull options
     */
    public pull(options: PullOptions): Promise<K> {
        return new Promise<K>((resolve, reject) => {
            reject(new LayerException("No previous layer configured!"));
        });
    }

}
export abstract class LayerContainer<T extends DataFrame, K extends DataFrame> extends Layer<T, K> {
    private _layers: Array<Layer<any, any>> = new Array<Layer<any, any>>();

    constructor(name: string) {
        super(name);
    }

    /**
     * Push the data to the container
     * @param data Input data
     * @param options Push options
     */
    public abstract push(data: T, options: PushOptions): Promise<void>;

    /**
     * Pull the data from the last layer in the container
     * @param options Pull options
     */
    public abstract pull(options: PullOptions): Promise<K>;

    /**
     * Add a new layer to the model
     * @param layer Layer to add
     */
    public addLayer(layer: Layer<any, any>): LayerContainer<T, K> {
        // Get the previous layer
        if (this._layers.length === 0) {
            // First layer
            if (this.getPreviousLayer() !== null) {
                layer.setPreviousLayer(this.getPreviousLayer());
            }
        } else {
            const lastLayer = this._layers[this._layers.length - 1];
            // Check the output type of the last layer
    
            lastLayer.setNextLayer(layer);
            layer.setPreviousLayer(lastLayer);
        }
        // Add the layer to the container
        layer.setParent(this);
        this._layers.push(layer);
        return this;
    }

    /**
     * Set the previous layer or model
     * @param prevLayer Previous layer or model
     */
    public setPreviousLayer(prevLayer: Layer<any, T>): void {
        super.setPreviousLayer(prevLayer);
        if (this._layers.length !== 0) {
            this._layers[0].setPreviousLayer(prevLayer);
        }
    }

    public getLayers(): Array<Layer<any, any>> {
        return this._layers;
    }
}

import { LayerContainer, Layer } from "./Layer";
import { DataFrame } from "../data";
import { PushOptions, PullOptions } from "./DataOptions";
import { LayerException } from "../exceptions";

/**
 * Balance layer. This layer will divide the workload of pushed data
 * between one or more layers.
 */
export class BalanceLayerContainer<In extends DataFrame, Out extends DataFrame> extends LayerContainer<In, Out> {
    private _busyLayers: Array<Layer<any, any>> = new Array();
    private _queue: Array<{data: In, options: PushOptions, resolve: () => void, reject: (ex?: any) => void}> = new Array();

    constructor() {
        super("balancer");
    }

    /**
     * Push the data to the model
     * @param data Input data
     * @param options Push options
     */
    public push(data: In, options: PushOptions = PushOptions.DEFAULT): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let assigned = false;
            for (const layer of this.getLayers()) {
                if (this._busyLayers.indexOf(layer) === -1) {
                    // Layer is not busy - perform push
                    this._busyLayers.push(layer);
                    assigned = true;
                    layer.push(data, options).then(_ => {
                        this._busyLayers.splice(this._busyLayers.indexOf(layer), 1);
                        this._updateQueue();
                        resolve();
                    }).catch(ex => {
                        this._updateQueue();
                        reject(ex);
                    });
                    break;  // Stop Assigning
                }
            }
            if (!assigned) {
                // Add to queue
                this._queue.push({data, options, resolve, reject});
            }
        });
    }

    private _updateQueue() {
        if (this._queue.length !== 0) {
            for (const layer of this.getLayers()) {
                if (this._busyLayers.indexOf(layer) === -1) {
                    // Layer is not busy - perform push
                    const queue: {data: In, options: PushOptions, resolve: () => void, reject: (ex?: any) => void} = this._queue.pop();
                    layer.push(queue.data, queue.options).then(_ => {
                        this._busyLayers.splice(this._busyLayers.indexOf(layer), 1);
                        this._updateQueue();
                        queue.resolve();
                    }).catch(ex => {
                        this._updateQueue();
                        queue.reject(ex);
                    });
                    break;  // Stop Assigning
                }
            }
        }
    }

    /**
     * Add a new layer to the model
     * @param layer Layer to add
     */
    public addLayer(layer: Layer<any, any>): BalanceLayerContainer<In, Out> {
        // Add the layer to the container
        layer.setParent(this);
        layer.setInputLayer(this.getInputLayer());
        layer.setOutputLayer(this.getOutputLayer());
        this._layers.push(layer);
        return this;
    }

    /**
     * Set the input layer or model
     * @param input Previous layer or model
     */
    public setInputLayer(input: Layer<any, In>): void {
        this._layers.forEach(layer => {
            layer.setInputLayer(input);
        });
    }

    public setOutputLayer(output: Layer<Out, any>): void {
        this._layers.forEach(layer => {
            layer.setOutputLayer(output);
        });
    }

    /**
     * Pull the data from the last layer in the model
     * @param options Pull options
     */
    public pull(options: PullOptions = PullOptions.DEFAULT): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            reject(new LayerException(`This layer does not support pulling!`));
        });
    }

    public withLayer(layer: Layer<any, any>): BalanceLayerContainer<In, Out> {
        return this.addLayer(layer);
    }

}

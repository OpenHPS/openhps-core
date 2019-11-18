import { Model } from "../Model";
import { DataFrame } from "../data/DataFrame";
import { FlowType } from "./FlowType";
import { PullOptions } from "./PullOptions";
import { PushOptions } from "./PushOptions";

/**
 * # OpenHPS: Layer
 * General Layer of the OpenHPS [[Model]]
 */
export abstract class Layer<T extends DataFrame, K extends DataFrame> {
    private _inputFlowType: FlowType;
    private _outputFlowType: FlowType;
    private _name: string;
    private _model: Model<any,any>;
    private _prevLayer: Layer<any,T>;
    private _nextLayer: Layer<K,any>;

    /**
     * Create a new layer
     * @param name Layer name
     * @param flowType Layer in and out flow type
     */
    constructor(name: string = "default", flowType: FlowType = FlowType.UNSPECIFIED) {
        this._name = name;
        this._inputFlowType = flowType;
        this._outputFlowType = flowType;
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
     * Get data flow type
     */
    public getFlowType() : FlowType {
        return this.getInputFlowType();
    }

    /**
     * Set input flow type
     * @param flowType Flow type for input
     */
    public setInputFlowType(flowType: FlowType) : void {
        this._inputFlowType = flowType;
    }

    /**
     * Set output flow type
     * @param flowType Flow type for output
     */
    public setOutputFlowType(flowType: FlowType) : void {
        this._outputFlowType = flowType;
    }

    /**
     * Get input data flow type
     */
    public getInputFlowType() : FlowType {
        return this._inputFlowType;
    }

    /**
     * Get output data flow type
     */
    public getOutputFlowType() : FlowType {
        return this._outputFlowType;
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
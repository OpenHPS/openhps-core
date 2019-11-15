"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowType_1 = require("./FlowType");
class Layer {
    constructor(name = "default", flowType = FlowType_1.FlowType.UNSPECIFIED) {
        this._name = name;
        this._inputFlowType = flowType;
        this._outputFlowType = flowType;
    }
    getName() {
        return this._name;
    }
    getModel() {
        return this._model;
    }
    setModel(model) {
        this._model = model;
    }
    getFlowType() {
        return this.getInputFlowType();
    }
    setInputFlowType(flowType) {
        this._inputFlowType = flowType;
    }
    setOutputFlowType(flowType) {
        this._outputFlowType = flowType;
    }
    getInputFlowType() {
        return this._inputFlowType;
    }
    getOutputFlowType() {
        return this._outputFlowType;
    }
    getPreviousLayer() {
        return this._prevLayer;
    }
    setPreviousLayer(prevLayer) {
        this._prevLayer = prevLayer;
    }
    getNextLayer() {
        return this._nextLayer;
    }
    setNextLayer(nextLayer) {
        this._nextLayer = nextLayer;
    }
}
exports.Layer = Layer;
//# sourceMappingURL=Layer.js.map
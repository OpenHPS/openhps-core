"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Layer_1 = require("./layer/Layer");
const PushOptions_1 = require("./layer/PushOptions");
const PullOptions_1 = require("./layer/PullOptions");
class Model extends Layer_1.Layer {
    constructor(name = "model") {
        super(name);
        this._layers = new Array();
    }
    push(data, options = PushOptions_1.PushOptions.DEFAULT) {
        return new Promise((resolve, reject) => {
            let firstLayer = this._layers[0];
            if (firstLayer == null) {
                throw new Error(`No layers added to the model '${this.getName()}'!`);
            }
            firstLayer.push(data, options).then(result => {
                resolve(result);
            }).catch(ex => {
                reject(ex);
            });
        });
    }
    pull(options = PullOptions_1.PullOptions.DEFAULT) {
        return new Promise((resolve, reject) => {
            let lastLayer = this._layers[this._layers.length - 1];
            if (lastLayer == null) {
                throw new Error(`No layers added to the model '${this.getName()}'!`);
            }
            lastLayer.pull(options).then(result => {
                resolve(result);
            }).catch(ex => {
                reject(ex);
            });
        });
    }
    addLayer(layer) {
        if (this._layers.length == 0) {
            if (this.getPreviousLayer() != null) {
                layer.setPreviousLayer(this.getPreviousLayer());
            }
        }
        else {
            let lastLayer = this._layers[this._layers.length - 1];
            if (lastLayer.getFlowType() != layer.getFlowType()) {
                throw new Error(`Flow type of layer '${layer.getName()}' does not match flow type of the previous layer '${lastLayer.getName()}'!`);
            }
            lastLayer.setNextLayer(layer);
            layer.setPreviousLayer(lastLayer);
        }
        layer.setModel(this);
        this._layers.push(layer);
        return this;
    }
    setPreviousLayer(prevLayer) {
        super.setPreviousLayer(prevLayer);
        if (this._layers.length != 0) {
            this._layers[0].setPreviousLayer(prevLayer);
        }
    }
    getInputFlowType() {
        if (this._layers.length != 0) {
            return this._layers[0].getInputFlowType();
        }
        return null;
    }
    getOutputFlowType() {
        if (this._layers.length != 0) {
            return this._layers[this._layers.length - 1].getOutputFlowType();
        }
        return null;
    }
    addDataManager(manager) {
        this._managers.set(null, manager);
    }
    clear() {
        this._layers = new Array();
        return this;
    }
}
exports.Model = Model;
//# sourceMappingURL=Model.js.map
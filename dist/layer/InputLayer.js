"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Layer_1 = require("./Layer");
const FlowType_1 = require("./FlowType");
const PushOptions_1 = require("./PushOptions");
class InputLayer extends Layer_1.Layer {
    constructor(name = "input", flowType = FlowType_1.FlowType.UNSPECIFIED) {
        super(name, flowType);
    }
    push(data, options = PushOptions_1.PushOptions.DEFAULT) {
        return new Promise((resolve, reject) => {
            this.getNextLayer().push(data, options).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }
}
exports.InputLayer = InputLayer;
//# sourceMappingURL=InputLayer.js.map
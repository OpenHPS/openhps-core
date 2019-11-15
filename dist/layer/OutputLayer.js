"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Layer_1 = require("./Layer");
const FlowType_1 = require("./FlowType");
const PullOptions_1 = require("./PullOptions");
class OutputLayer extends Layer_1.Layer {
    constructor(name = "output", flowType = FlowType_1.FlowType.UNSPECIFIED) {
        super(name, flowType);
    }
    push(data, options) {
        return new Promise((resolve, reject) => {
        });
    }
    pull(options = PullOptions_1.PullOptions.DEFAULT) {
        return new Promise((resolve, reject) => {
            this.getPreviousLayer().pull(options).then(data => {
                resolve(data);
            }).catch(ex => {
                reject(ex);
            });
        });
    }
}
exports.OutputLayer = OutputLayer;
//# sourceMappingURL=OutputLayer.js.map
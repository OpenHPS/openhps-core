"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Layer_1 = require("./Layer");
const FlowType_1 = require("./FlowType");
class ProcessingLayer extends Layer_1.Layer {
    constructor(name = "processor", flowType = FlowType_1.FlowType.UNSPECIFIED) {
        super(name, flowType);
    }
}
exports.ProcessingLayer = ProcessingLayer;
//# sourceMappingURL=ProcessingLayer.js.map
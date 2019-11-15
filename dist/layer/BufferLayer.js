"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Layer_1 = require("./Layer");
const FlowType_1 = require("./FlowType");
class BufferLayer extends Layer_1.Layer {
    constructor(name = "buffer") {
        super(name);
        this.setInputFlowType(FlowType_1.FlowType.PUSH);
        this.setOutputFlowType(FlowType_1.FlowType.PULL);
    }
}
exports.BufferLayer = BufferLayer;
//# sourceMappingURL=BufferLayer.js.map
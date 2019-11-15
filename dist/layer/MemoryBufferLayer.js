"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BufferLayer_1 = require("./BufferLayer");
class MemoryBufferLayer extends BufferLayer_1.BufferLayer {
    constructor(name = "memorybuffer") {
        super(name);
    }
    push(data, options) {
        return new Promise((resolve, reject) => {
        });
    }
    pull(options) {
        return new Promise((resolve, reject) => {
        });
    }
}
exports.MemoryBufferLayer = MemoryBufferLayer;
//# sourceMappingURL=MemoryBufferLayer.js.map
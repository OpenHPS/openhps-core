"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataFrame {
    constructor() {
        this._objects = Array();
        this.setTimestamp(Date.now());
    }
    getTimestamp() {
        return this._timestamp;
    }
    setTimestamp(timestamp) {
        this._timestamp = timestamp;
    }
    getTrackedIndividuals() {
        return this._objects;
    }
    addTrackedIndividual(object) {
        this._objects.push(object);
    }
}
exports.DataFrame = DataFrame;
//# sourceMappingURL=DataFrame.js.map
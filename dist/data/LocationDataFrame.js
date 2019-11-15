"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataFrame_1 = require("./DataFrame");
class LocationDataFrame extends DataFrame_1.DataFrame {
    constructor() {
        super(...arguments);
        this._location = null;
    }
    getLocation() {
        return this._location;
    }
}
exports.LocationDataFrame = LocationDataFrame;
//# sourceMappingURL=LocationDataFrame.js.map
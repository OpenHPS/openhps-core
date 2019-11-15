"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Object {
    constructor(id) {
        this._relativeLocations = new Array();
        this._id = id;
    }
    getId() {
        return this._id;
    }
    getDisplayName() {
        return this._displayName;
    }
    setDisplayName(displayName) {
        this._displayName = displayName;
    }
    getAbsoluteLocation() {
        return this._absoluteLocation;
    }
    setAbsoluteLocation(absoluteLocation) {
        this._absoluteLocation = absoluteLocation;
    }
}
exports.Object = Object;
//# sourceMappingURL=Object.js.map
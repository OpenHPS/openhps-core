"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Location_1 = require("./Location");
class AbsoluteLocation extends Location_1.Location {
    getLatitude() {
        return this._lat;
    }
    setLatitude(lat) {
        this._lat = lat;
    }
    getLongitude() {
        return this._lng;
    }
    setLongitude(lng) {
        this._lng = lng;
    }
    getAltitude() {
        return this._mamsl;
    }
    setAltitude(mamsl) {
        this._mamsl = mamsl;
    }
    toECR() {
        let point = new Array();
        return point;
    }
    static fromECR(ecr) {
        return null;
    }
}
exports.AbsoluteLocation = AbsoluteLocation;
//# sourceMappingURL=AbsoluteLocation.js.map
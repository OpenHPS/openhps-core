"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectManager {
    constructor() {
        this._objects = new Map();
    }
    findById(id) {
        return new Promise((resolve, reject) => {
            if (this._objects.has(id)) {
                resolve(this._objects.get(id));
            }
            else {
                resolve(null);
            }
        });
    }
    track(object) {
        return new Promise((resolve, reject) => {
            if (this._objects.has(object.getId())) {
            }
            else {
                this._objects.set(object.getId(), object);
            }
        });
    }
    untrack(object) {
        return new Promise((resolve, reject) => {
        });
    }
}
exports.ObjectManager = ObjectManager;
//# sourceMappingURL=ObjectManager.js.map
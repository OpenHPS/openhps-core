(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@openhps/core"));
	else if(typeof define === 'function' && define.amd)
		define("OpenHPS", ["core"], factory);
	else if(typeof exports === 'object')
		exports["OpenHPS"] = factory(require("@openhps/core"));
	else
		root["OpenHPS"] = root["OpenHPS"] || {}, root["OpenHPS"]["geospatial"] = factory(root["OpenHPS"]["core"]);
})((typeof self !== 'undefined' ? self : this), function(__WEBPACK_EXTERNAL_MODULE__openhps_core__) {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./dist/cjs/data/Building.js":
/*!***********************************!*\
  !*** ./dist/cjs/data/Building.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Building = void 0;
const core_1 = __webpack_require__(/*! @openhps/core */ "@openhps/core");
const SymbolicSpace_1 = __webpack_require__(/*! ./SymbolicSpace */ "./dist/cjs/data/SymbolicSpace.js");
let Building = class Building extends SymbolicSpace_1.SymbolicSpace {
    setBounds(bounds) {
        if (Array.isArray(bounds)) {
            super.setBounds(bounds);
        }
        else if ('width' in bounds) {
            const eulerRotation = new core_1.Euler(0, 0, bounds.rotation, 'XYZ', core_1.AngleUnit.DEGREE);
            this.rotation(eulerRotation);
            const topRight = bounds.topLeft.destination(bounds.rotation, bounds.width);
            const bottomRight = topRight.destination(bounds.rotation + 90, bounds.height);
            const bottomLeft = bounds.topLeft.destination(bounds.rotation + 90, bounds.height);
            super.setBounds([bottomLeft, bounds.topLeft, topRight, bottomRight]);
        }
        else {
            super.setBounds(bounds);
        }
        return this;
    }
    getLocalBounds() {
        const localBounds = [new core_1.Absolute2DPosition(0, 0)];
        for (let i = 1; i < this.getBounds().length; i++) {
            const b1 = this.getBounds()[i - 1];
            const b2 = this.getBounds()[i];
            const d = b1.distanceTo(b2);
            const a = b1.angleTo(b2) - this.rotationQuaternion.toEuler().z;
            const prev = localBounds[i - 1];
            const positionVector = new core_1.Vector2(prev.x, prev.y);
            localBounds.push(new core_1.Absolute2DPosition().fromVector(positionVector.add(new core_1.Vector2(d, 0).rotateAround(new core_1.Vector2(0, 0), -a))));
        }
        return localBounds;
    }
    transform(position, options) {
        const origin = this.getBounds()[0];
        const angle = this.rotationQuaternion.toEuler().yaw;
        if (position instanceof core_1.GeographicalPosition) {
            const d = origin.distanceTo(position);
            const a = angle - origin.bearing(position);
            const localOrigin = this.getLocalBounds()[0].clone();
            const localOriginVector = new core_1.Vector2(localOrigin.x, localOrigin.y);
            localOriginVector.add(new core_1.Vector2(d).rotateAround(new core_1.Vector2(0, 0), core_1.AngleUnit.DEGREE.convert(a, core_1.AngleUnit.RADIAN)));
            localOrigin.fromVector(localOriginVector);
            return localOrigin;
        }
        else if (position instanceof core_1.Absolute2DPosition) {
            return origin.destination(angle, position.x).destination(angle - 90, position.y);
        }
    }
};
Building = __decorate([
    (0, core_1.SerializableObject)()
], Building);
exports.Building = Building;
//# sourceMappingURL=Building.js.map

/***/ }),

/***/ "./dist/cjs/data/Corridor.js":
/*!***********************************!*\
  !*** ./dist/cjs/data/Corridor.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Corridor = void 0;
const core_1 = __webpack_require__(/*! @openhps/core */ "@openhps/core");
const Zone_1 = __webpack_require__(/*! ./Zone */ "./dist/cjs/data/Zone.js");
let Corridor = class Corridor extends Zone_1.Zone {
};
Corridor = __decorate([
    (0, core_1.SerializableObject)()
], Corridor);
exports.Corridor = Corridor;
//# sourceMappingURL=Corridor.js.map

/***/ }),

/***/ "./dist/cjs/data/Elevator.js":
/*!***********************************!*\
  !*** ./dist/cjs/data/Elevator.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Elevator = void 0;
const core_1 = __webpack_require__(/*! @openhps/core */ "@openhps/core");
const VerticalPassage_1 = __webpack_require__(/*! ./VerticalPassage */ "./dist/cjs/data/VerticalPassage.js");
let Elevator = class Elevator extends VerticalPassage_1.VerticalPassage {
};
Elevator = __decorate([
    (0, core_1.SerializableObject)()
], Elevator);
exports.Elevator = Elevator;
//# sourceMappingURL=Elevator.js.map

/***/ }),

/***/ "./dist/cjs/data/Floor.js":
/*!********************************!*\
  !*** ./dist/cjs/data/Floor.js ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Floor = void 0;
const core_1 = __webpack_require__(/*! @openhps/core */ "@openhps/core");
const SymbolicSpace_1 = __webpack_require__(/*! ./SymbolicSpace */ "./dist/cjs/data/SymbolicSpace.js");
let Floor = class Floor extends SymbolicSpace_1.SymbolicSpace {
    setBuilding(building) {
        this.parent = building;
        this.setBounds(building.getLocalBounds());
        this.priority = building.priority + 1;
        return this;
    }
    setFloorNumber(floor, floorHeight = 3) {
        this.translation(0, 0, floor * floorHeight);
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
};
__decorate([
    (0, core_1.SerializableMember)(),
    __metadata("design:type", Number)
], Floor.prototype, "height", void 0);
Floor = __decorate([
    (0, core_1.SerializableObject)()
], Floor);
exports.Floor = Floor;
//# sourceMappingURL=Floor.js.map

/***/ }),

/***/ "./dist/cjs/data/GeospatialAccuracy.js":
/*!*********************************************!*\
  !*** ./dist/cjs/data/GeospatialAccuracy.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeospatialAccuracy = void 0;
const core_1 = __webpack_require__(/*! @openhps/core */ "@openhps/core");
let GeospatialAccuracy = class GeospatialAccuracy extends core_1.Accuracy {
    constructor(space) {
        super(space, core_1.LengthUnit.METER);
    }
    toString() {
        return this.value.displayName;
    }
    valueOf() {
        return this.value
            .getBounds()
            .map((pos) => this.value.centroid.distanceTo(pos))
            .reduce((a, b) => Math.max(a, b), 0);
    }
};
GeospatialAccuracy = __decorate([
    (0, core_1.SerializableObject)(),
    __metadata("design:paramtypes", [Object])
], GeospatialAccuracy);
exports.GeospatialAccuracy = GeospatialAccuracy;
//# sourceMappingURL=GeospatialAccuracy.js.map

/***/ }),

/***/ "./dist/cjs/data/Room.js":
/*!*******************************!*\
  !*** ./dist/cjs/data/Room.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Room = void 0;
const core_1 = __webpack_require__(/*! @openhps/core */ "@openhps/core");
const Zone_1 = __webpack_require__(/*! ./Zone */ "./dist/cjs/data/Zone.js");
let Room = class Room extends Zone_1.Zone {
};
Room = __decorate([
    (0, core_1.SerializableObject)()
], Room);
exports.Room = Room;
//# sourceMappingURL=Room.js.map

/***/ }),

/***/ "./dist/cjs/data/SymbolicSpace.js":
/*!****************************************!*\
  !*** ./dist/cjs/data/SymbolicSpace.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SymbolicSpace = void 0;
const core_1 = __webpack_require__(/*! @openhps/core */ "@openhps/core");
let SymbolicSpace = class SymbolicSpace extends core_1.ReferenceSpace {
    constructor(displayName) {
        super();
        this.coordinates = [];
        this.connectedSpaces = new Map();
        this.priority = 0;
        this.displayName = displayName;
    }
    setBounds(bounds) {
        if (Array.isArray(bounds)) {
            this._setArrayBounds(bounds);
        }
        else if ('topLeft' in bounds) {
            this._setRectangleBounds(bounds);
        }
        this._update();
        return this;
    }
    _setRectangleBounds(bounds) {
        if ('width' in bounds) {
            const eulerRotation = new core_1.Euler(0, 0, bounds.rotation, 'XYZ', core_1.AngleUnit.DEGREE);
            this.rotation(eulerRotation);
            const topRight = bounds.topLeft.toVector3(core_1.LengthUnit.METER);
            topRight.add(new core_1.Vector3(bounds.width, 0, 0).applyEuler(eulerRotation));
            const bottomLeft = bounds.topLeft.toVector3(core_1.LengthUnit.METER);
            bottomLeft.add(new core_1.Vector3(0, bounds.height, 0).applyEuler(eulerRotation));
            const bottomRight = bounds.topLeft.toVector3(core_1.LengthUnit.METER);
            bottomRight.add(new core_1.Vector3(bounds.width, bounds.height, 0).applyEuler(eulerRotation));
            this._setArrayBounds([
                bounds.topLeft.clone().fromVector(bottomLeft, core_1.LengthUnit.METER),
                bounds.topLeft,
                bounds.topLeft.clone().fromVector(topRight, core_1.LengthUnit.METER),
                bounds.topLeft.clone().fromVector(bottomRight, core_1.LengthUnit.METER),
            ]);
        }
        else {
            this._setArrayBounds([bounds.topLeft, bounds.bottomRight]);
        }
    }
    _setArrayBounds(bounds) {
        this.positionConstructor = bounds[0].constructor;
        const points = bounds.map((bound) => bound.toVector3(core_1.LengthUnit.METER));
        if (bounds.length === 2) {
            const topLeft = points[0];
            const bottomRight = points[1];
            const diff = bottomRight.clone().sub(topLeft);
            const zCount = points.map((p) => p.z).reduce((a, b) => a + b);
            if (zCount !== 0) {
                this.coordinates.push(topLeft);
                this.coordinates.push(topLeft.clone().add(new core_1.Vector3(diff.x, 0, 0)));
                this.coordinates.push(topLeft.clone().add(new core_1.Vector3(0, diff.y, 0)));
                this.coordinates.push(topLeft.clone().add(new core_1.Vector3(diff.x, diff.y, 0)));
                this.coordinates.push(topLeft.clone().add(new core_1.Vector3(diff.x, 0, diff.z)));
                this.coordinates.push(topLeft.clone().add(new core_1.Vector3(0, diff.y, diff.z)));
                this.coordinates.push(topLeft.clone().add(new core_1.Vector3(0, 0, diff.z)));
                this.coordinates.push(bottomRight);
            }
            else {
                this.coordinates.push(topLeft.clone().add(new core_1.Vector3(0, diff.y, 0)));
                this.coordinates.push(topLeft);
                this.coordinates.push(topLeft.clone().add(new core_1.Vector3(diff.x, 0, 0)));
                this.coordinates.push(bottomRight);
            }
        }
        else {
            this.coordinates = points;
        }
    }
    getBounds() {
        return this.coordinates.map((point) => {
            const position = new this.positionConstructor();
            position.fromVector(point, core_1.LengthUnit.METER);
            return position;
        });
    }
    _update() {
        this.centroid = new this.positionConstructor();
        this.centroid.referenceSpaceUID = this.uid;
        const centerPoint = this.coordinates.reduce((a, b) => a.clone().add(b)).divideScalar(this.coordinates.length);
        this.centroid.fromVector(centerPoint);
    }
    set parent(loc) {
        super.parent = loc;
    }
    isInside(position) {
        const point = position.toVector3();
        let inside = false;
        for (let i = 0, j = this.coordinates.length - 1; i < this.coordinates.length; j = i++) {
            const xi = this.coordinates[i].x;
            const yi = this.coordinates[i].y;
            const zi = this.coordinates[i].z;
            const xj = this.coordinates[j].x;
            const yj = this.coordinates[j].y;
            const zj = this.coordinates[j].z;
            const intersect = yi > point.y != yj > point.y &&
                zi >= point.z != zj > point.z &&
                point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
            if (intersect)
                inside = !inside;
        }
        return inside;
    }
    isConnected(space) {
        return Array.from(this.connectedSpaces.values()).includes(space.uid);
    }
    addConnectedSpace(space, position) {
        this.connectedSpaces.set(position.toVector3(), space.uid);
        return this;
    }
    toPosition() {
        return this.centroid;
    }
    toGeoJSON() {
        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [this.getBounds().map((p) => this.transform(p).toVector3().toArray())],
            },
            properties: {
                name: this.displayName,
                uid: this.uid,
                parent_uid: this.parentUID,
                priority: this.priority,
                type: this.constructor.name,
            },
        };
    }
};
__decorate([
    (0, core_1.SerializableArrayMember)(core_1.Vector3),
    __metadata("design:type", Array)
], SymbolicSpace.prototype, "coordinates", void 0);
__decorate([
    (0, core_1.SerializableMember)({
        serializer: (constructor) => {
            if (!constructor) {
                return core_1.AbsolutePosition.name;
            }
            return constructor.name;
        },
        deserializer: (constructorName) => {
            return core_1.DataSerializer.findTypeByName(constructorName);
        },
    }),
    __metadata("design:type", Function)
], SymbolicSpace.prototype, "positionConstructor", void 0);
__decorate([
    (0, core_1.SerializableMember)(),
    __metadata("design:type", core_1.AbsolutePosition)
], SymbolicSpace.prototype, "centroid", void 0);
__decorate([
    (0, core_1.SerializableMapMember)(core_1.Vector3, String),
    __metadata("design:type", Map)
], SymbolicSpace.prototype, "connectedSpaces", void 0);
__decorate([
    (0, core_1.SerializableMember)({
        constructor: Number,
    }),
    __metadata("design:type", Object)
], SymbolicSpace.prototype, "priority", void 0);
SymbolicSpace = __decorate([
    (0, core_1.SerializableObject)(),
    __metadata("design:paramtypes", [String])
], SymbolicSpace);
exports.SymbolicSpace = SymbolicSpace;
//# sourceMappingURL=SymbolicSpace.js.map

/***/ }),

/***/ "./dist/cjs/data/VerticalPassage.js":
/*!******************************************!*\
  !*** ./dist/cjs/data/VerticalPassage.js ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VerticalPassage = void 0;
const core_1 = __webpack_require__(/*! @openhps/core */ "@openhps/core");
const SymbolicSpace_1 = __webpack_require__(/*! ./SymbolicSpace */ "./dist/cjs/data/SymbolicSpace.js");
let VerticalPassage = class VerticalPassage extends SymbolicSpace_1.SymbolicSpace {
};
VerticalPassage = __decorate([
    (0, core_1.SerializableObject)()
], VerticalPassage);
exports.VerticalPassage = VerticalPassage;
//# sourceMappingURL=VerticalPassage.js.map

/***/ }),

/***/ "./dist/cjs/data/Zone.js":
/*!*******************************!*\
  !*** ./dist/cjs/data/Zone.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Zone = void 0;
const core_1 = __webpack_require__(/*! @openhps/core */ "@openhps/core");
const SymbolicSpace_1 = __webpack_require__(/*! ./SymbolicSpace */ "./dist/cjs/data/SymbolicSpace.js");
let Zone = class Zone extends SymbolicSpace_1.SymbolicSpace {
    setFloor(floor) {
        this.parent = floor;
        this.priority = floor.priority + 1;
        return this;
    }
};
Zone = __decorate([
    (0, core_1.SerializableObject)()
], Zone);
exports.Zone = Zone;
//# sourceMappingURL=Zone.js.map

/***/ }),

/***/ "./dist/cjs/data/index.js":
/*!********************************!*\
  !*** ./dist/cjs/data/index.js ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./SymbolicSpace */ "./dist/cjs/data/SymbolicSpace.js"), exports);
__exportStar(__webpack_require__(/*! ./Room */ "./dist/cjs/data/Room.js"), exports);
__exportStar(__webpack_require__(/*! ./Building */ "./dist/cjs/data/Building.js"), exports);
__exportStar(__webpack_require__(/*! ./Floor */ "./dist/cjs/data/Floor.js"), exports);
__exportStar(__webpack_require__(/*! ./Corridor */ "./dist/cjs/data/Corridor.js"), exports);
__exportStar(__webpack_require__(/*! ./Zone */ "./dist/cjs/data/Zone.js"), exports);
__exportStar(__webpack_require__(/*! ./VerticalPassage */ "./dist/cjs/data/VerticalPassage.js"), exports);
__exportStar(__webpack_require__(/*! ./Elevator */ "./dist/cjs/data/Elevator.js"), exports);
__exportStar(__webpack_require__(/*! ./GeospatialAccuracy */ "./dist/cjs/data/GeospatialAccuracy.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/cjs/index.js":
/*!***************************!*\
  !*** ./dist/cjs/index.js ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./data */ "./dist/cjs/data/index.js"), exports);
__exportStar(__webpack_require__(/*! ./services */ "./dist/cjs/services/index.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/cjs/services/SymbolicSpaceService.js":
/*!***************************************************!*\
  !*** ./dist/cjs/services/SymbolicSpaceService.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SymbolicSpaceService = void 0;
const core_1 = __webpack_require__(/*! @openhps/core */ "@openhps/core");
class SymbolicSpaceService extends core_1.DataObjectService {
    constructor(dataServiceDriver) {
        super(dataServiceDriver);
    }
    findSymbolicSpaces(position) {
        return new Promise((resolve, reject) => {
            this.findAll()
                .then((results) => {
                resolve(results
                    .filter((res) => res.isInside(position))
                    .sort((a, b) => b.priority - a.priority)
                    .map((res) => [res, res.priority]));
            })
                .catch(reject);
        });
    }
}
exports.SymbolicSpaceService = SymbolicSpaceService;
//# sourceMappingURL=SymbolicSpaceService.js.map

/***/ }),

/***/ "./dist/cjs/services/index.js":
/*!************************************!*\
  !*** ./dist/cjs/services/index.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./SymbolicSpaceService */ "./dist/cjs/services/SymbolicSpaceService.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "@openhps/core":
/*!****************************************************************************************************************!*\
  !*** external {"commonjs":"@openhps/core","commonjs2":"@openhps/core","amd":"core","root":["OpenHPS","core"]} ***!
  \****************************************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__openhps_core__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./dist/cjs/index.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=openhps-geospatial.js.map
import * as __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__ from "./openhps-core.es.js";
/******/ var __webpack_modules__ = ({

/***/ "./dist/esm/data/Building.js":
/*!***********************************!*\
  !*** ./dist/esm/data/Building.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Building": () => (/* binding */ Building)
/* harmony export */ });
/* harmony import */ var _openhps_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openhps/core */ "@openhps/core");
/* harmony import */ var _SymbolicSpace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SymbolicSpace */ "./dist/esm/data/SymbolicSpace.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let Building = class Building extends _SymbolicSpace__WEBPACK_IMPORTED_MODULE_1__.SymbolicSpace {
    setBounds(bounds) {
        if (Array.isArray(bounds)) {
            super.setBounds(bounds);
        }
        else if ('width' in bounds) {
            const eulerRotation = new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Euler(0, 0, bounds.rotation, 'XYZ', _openhps_core__WEBPACK_IMPORTED_MODULE_0__.AngleUnit.DEGREE);
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
        const localBounds = [new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Absolute2DPosition(0, 0)];
        for (let i = 1; i < this.getBounds().length; i++) {
            const b1 = this.getBounds()[i - 1];
            const b2 = this.getBounds()[i];
            const d = b1.distanceTo(b2);
            const a = b1.angleTo(b2) - this.rotationQuaternion.toEuler().z;
            const prev = localBounds[i - 1];
            const positionVector = new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector2(prev.x, prev.y);
            localBounds.push(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Absolute2DPosition().fromVector(positionVector.add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector2(d, 0).rotateAround(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector2(0, 0), -a))));
        }
        return localBounds;
    }
    transform(position, options) {
        const origin = this.getBounds()[0];
        const angle = this.rotationQuaternion.toEuler().yaw;
        if (position instanceof _openhps_core__WEBPACK_IMPORTED_MODULE_0__.GeographicalPosition) {
            const d = origin.distanceTo(position);
            const a = angle - origin.bearing(position);
            const localOrigin = this.getLocalBounds()[0].clone();
            const localOriginVector = new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector2(localOrigin.x, localOrigin.y);
            localOriginVector.add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector2(d).rotateAround(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector2(0, 0), _openhps_core__WEBPACK_IMPORTED_MODULE_0__.AngleUnit.DEGREE.convert(a, _openhps_core__WEBPACK_IMPORTED_MODULE_0__.AngleUnit.RADIAN)));
            localOrigin.fromVector(localOriginVector);
            return localOrigin;
        }
        else if (position instanceof _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Absolute2DPosition) {
            return origin.destination(angle, position.x).destination(angle - 90, position.y);
        }
    }
};
Building = __decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableObject)()
], Building);

//# sourceMappingURL=Building.js.map

/***/ }),

/***/ "./dist/esm/data/Corridor.js":
/*!***********************************!*\
  !*** ./dist/esm/data/Corridor.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Corridor": () => (/* binding */ Corridor)
/* harmony export */ });
/* harmony import */ var _openhps_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openhps/core */ "@openhps/core");
/* harmony import */ var _Zone__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Zone */ "./dist/esm/data/Zone.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let Corridor = class Corridor extends _Zone__WEBPACK_IMPORTED_MODULE_1__.Zone {
};
Corridor = __decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableObject)()
], Corridor);

//# sourceMappingURL=Corridor.js.map

/***/ }),

/***/ "./dist/esm/data/Elevator.js":
/*!***********************************!*\
  !*** ./dist/esm/data/Elevator.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Elevator": () => (/* binding */ Elevator)
/* harmony export */ });
/* harmony import */ var _openhps_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openhps/core */ "@openhps/core");
/* harmony import */ var _VerticalPassage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./VerticalPassage */ "./dist/esm/data/VerticalPassage.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let Elevator = class Elevator extends _VerticalPassage__WEBPACK_IMPORTED_MODULE_1__.VerticalPassage {
};
Elevator = __decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableObject)()
], Elevator);

//# sourceMappingURL=Elevator.js.map

/***/ }),

/***/ "./dist/esm/data/Floor.js":
/*!********************************!*\
  !*** ./dist/esm/data/Floor.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Floor": () => (/* binding */ Floor)
/* harmony export */ });
/* harmony import */ var _openhps_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openhps/core */ "@openhps/core");
/* harmony import */ var _SymbolicSpace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SymbolicSpace */ "./dist/esm/data/SymbolicSpace.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


let Floor = class Floor extends _SymbolicSpace__WEBPACK_IMPORTED_MODULE_1__.SymbolicSpace {
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
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableMember)(),
    __metadata("design:type", Number)
], Floor.prototype, "height", void 0);
Floor = __decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableObject)()
], Floor);

//# sourceMappingURL=Floor.js.map

/***/ }),

/***/ "./dist/esm/data/GeospatialAccuracy.js":
/*!*********************************************!*\
  !*** ./dist/esm/data/GeospatialAccuracy.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GeospatialAccuracy": () => (/* binding */ GeospatialAccuracy)
/* harmony export */ });
/* harmony import */ var _openhps_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openhps/core */ "@openhps/core");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

let GeospatialAccuracy = class GeospatialAccuracy extends _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Accuracy {
    constructor(space) {
        super(space, _openhps_core__WEBPACK_IMPORTED_MODULE_0__.LengthUnit.METER);
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
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableObject)(),
    __metadata("design:paramtypes", [Object])
], GeospatialAccuracy);

//# sourceMappingURL=GeospatialAccuracy.js.map

/***/ }),

/***/ "./dist/esm/data/Room.js":
/*!*******************************!*\
  !*** ./dist/esm/data/Room.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Room": () => (/* binding */ Room)
/* harmony export */ });
/* harmony import */ var _openhps_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openhps/core */ "@openhps/core");
/* harmony import */ var _Zone__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Zone */ "./dist/esm/data/Zone.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let Room = class Room extends _Zone__WEBPACK_IMPORTED_MODULE_1__.Zone {
};
Room = __decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableObject)()
], Room);

//# sourceMappingURL=Room.js.map

/***/ }),

/***/ "./dist/esm/data/SymbolicSpace.js":
/*!****************************************!*\
  !*** ./dist/esm/data/SymbolicSpace.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SymbolicSpace": () => (/* binding */ SymbolicSpace)
/* harmony export */ });
/* harmony import */ var _openhps_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openhps/core */ "@openhps/core");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

let SymbolicSpace = class SymbolicSpace extends _openhps_core__WEBPACK_IMPORTED_MODULE_0__.ReferenceSpace {
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
            const eulerRotation = new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Euler(0, 0, bounds.rotation, 'XYZ', _openhps_core__WEBPACK_IMPORTED_MODULE_0__.AngleUnit.DEGREE);
            this.rotation(eulerRotation);
            const topRight = bounds.topLeft.toVector3(_openhps_core__WEBPACK_IMPORTED_MODULE_0__.LengthUnit.METER);
            topRight.add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(bounds.width, 0, 0).applyEuler(eulerRotation));
            const bottomLeft = bounds.topLeft.toVector3(_openhps_core__WEBPACK_IMPORTED_MODULE_0__.LengthUnit.METER);
            bottomLeft.add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, bounds.height, 0).applyEuler(eulerRotation));
            const bottomRight = bounds.topLeft.toVector3(_openhps_core__WEBPACK_IMPORTED_MODULE_0__.LengthUnit.METER);
            bottomRight.add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(bounds.width, bounds.height, 0).applyEuler(eulerRotation));
            this._setArrayBounds([
                bounds.topLeft.clone().fromVector(bottomLeft, _openhps_core__WEBPACK_IMPORTED_MODULE_0__.LengthUnit.METER),
                bounds.topLeft,
                bounds.topLeft.clone().fromVector(topRight, _openhps_core__WEBPACK_IMPORTED_MODULE_0__.LengthUnit.METER),
                bounds.topLeft.clone().fromVector(bottomRight, _openhps_core__WEBPACK_IMPORTED_MODULE_0__.LengthUnit.METER),
            ]);
        }
        else {
            this._setArrayBounds([bounds.topLeft, bounds.bottomRight]);
        }
    }
    _setArrayBounds(bounds) {
        this.positionConstructor = bounds[0].constructor;
        const points = bounds.map((bound) => bound.toVector3(_openhps_core__WEBPACK_IMPORTED_MODULE_0__.LengthUnit.METER));
        if (bounds.length === 2) {
            const topLeft = points[0];
            const bottomRight = points[1];
            const diff = bottomRight.clone().sub(topLeft);
            const zCount = points.map((p) => p.z).reduce((a, b) => a + b);
            if (zCount !== 0) {
                this.coordinates.push(topLeft);
                this.coordinates.push(topLeft.clone().add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(diff.x, 0, 0)));
                this.coordinates.push(topLeft.clone().add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, diff.y, 0)));
                this.coordinates.push(topLeft.clone().add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(diff.x, diff.y, 0)));
                this.coordinates.push(topLeft.clone().add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(diff.x, 0, diff.z)));
                this.coordinates.push(topLeft.clone().add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, diff.y, diff.z)));
                this.coordinates.push(topLeft.clone().add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, diff.z)));
                this.coordinates.push(bottomRight);
            }
            else {
                this.coordinates.push(topLeft.clone().add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, diff.y, 0)));
                this.coordinates.push(topLeft);
                this.coordinates.push(topLeft.clone().add(new _openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3(diff.x, 0, 0)));
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
            position.fromVector(point, _openhps_core__WEBPACK_IMPORTED_MODULE_0__.LengthUnit.METER);
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
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableArrayMember)(_openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3),
    __metadata("design:type", Array)
], SymbolicSpace.prototype, "coordinates", void 0);
__decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableMember)({
        serializer: (constructor) => {
            return constructor.name;
        },
        deserializer: (constructorName) => {
            return _openhps_core__WEBPACK_IMPORTED_MODULE_0__.DataSerializer.findTypeByName(constructorName);
        },
    }),
    __metadata("design:type", Function)
], SymbolicSpace.prototype, "positionConstructor", void 0);
__decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableMember)(),
    __metadata("design:type", _openhps_core__WEBPACK_IMPORTED_MODULE_0__.AbsolutePosition)
], SymbolicSpace.prototype, "centroid", void 0);
__decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableMapMember)(_openhps_core__WEBPACK_IMPORTED_MODULE_0__.Vector3, String),
    __metadata("design:type", Map)
], SymbolicSpace.prototype, "connectedSpaces", void 0);
__decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableMember)({
        constructor: Number,
    }),
    __metadata("design:type", Object)
], SymbolicSpace.prototype, "priority", void 0);
SymbolicSpace = __decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableObject)(),
    __metadata("design:paramtypes", [String])
], SymbolicSpace);

//# sourceMappingURL=SymbolicSpace.js.map

/***/ }),

/***/ "./dist/esm/data/VerticalPassage.js":
/*!******************************************!*\
  !*** ./dist/esm/data/VerticalPassage.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VerticalPassage": () => (/* binding */ VerticalPassage)
/* harmony export */ });
/* harmony import */ var _openhps_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openhps/core */ "@openhps/core");
/* harmony import */ var _SymbolicSpace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SymbolicSpace */ "./dist/esm/data/SymbolicSpace.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let VerticalPassage = class VerticalPassage extends _SymbolicSpace__WEBPACK_IMPORTED_MODULE_1__.SymbolicSpace {
};
VerticalPassage = __decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableObject)()
], VerticalPassage);

//# sourceMappingURL=VerticalPassage.js.map

/***/ }),

/***/ "./dist/esm/data/Zone.js":
/*!*******************************!*\
  !*** ./dist/esm/data/Zone.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Zone": () => (/* binding */ Zone)
/* harmony export */ });
/* harmony import */ var _openhps_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openhps/core */ "@openhps/core");
/* harmony import */ var _SymbolicSpace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SymbolicSpace */ "./dist/esm/data/SymbolicSpace.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let Zone = class Zone extends _SymbolicSpace__WEBPACK_IMPORTED_MODULE_1__.SymbolicSpace {
    setFloor(floor) {
        this.parent = floor;
        this.priority = floor.priority + 1;
        return this;
    }
};
Zone = __decorate([
    (0,_openhps_core__WEBPACK_IMPORTED_MODULE_0__.SerializableObject)()
], Zone);

//# sourceMappingURL=Zone.js.map

/***/ }),

/***/ "./dist/esm/data/index.js":
/*!********************************!*\
  !*** ./dist/esm/data/index.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SymbolicSpace": () => (/* reexport safe */ _SymbolicSpace__WEBPACK_IMPORTED_MODULE_0__.SymbolicSpace),
/* harmony export */   "Room": () => (/* reexport safe */ _Room__WEBPACK_IMPORTED_MODULE_1__.Room),
/* harmony export */   "Building": () => (/* reexport safe */ _Building__WEBPACK_IMPORTED_MODULE_2__.Building),
/* harmony export */   "Floor": () => (/* reexport safe */ _Floor__WEBPACK_IMPORTED_MODULE_3__.Floor),
/* harmony export */   "Corridor": () => (/* reexport safe */ _Corridor__WEBPACK_IMPORTED_MODULE_4__.Corridor),
/* harmony export */   "Zone": () => (/* reexport safe */ _Zone__WEBPACK_IMPORTED_MODULE_5__.Zone),
/* harmony export */   "VerticalPassage": () => (/* reexport safe */ _VerticalPassage__WEBPACK_IMPORTED_MODULE_6__.VerticalPassage),
/* harmony export */   "Elevator": () => (/* reexport safe */ _Elevator__WEBPACK_IMPORTED_MODULE_7__.Elevator),
/* harmony export */   "GeospatialAccuracy": () => (/* reexport safe */ _GeospatialAccuracy__WEBPACK_IMPORTED_MODULE_8__.GeospatialAccuracy)
/* harmony export */ });
/* harmony import */ var _SymbolicSpace__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SymbolicSpace */ "./dist/esm/data/SymbolicSpace.js");
/* harmony import */ var _Room__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Room */ "./dist/esm/data/Room.js");
/* harmony import */ var _Building__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Building */ "./dist/esm/data/Building.js");
/* harmony import */ var _Floor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Floor */ "./dist/esm/data/Floor.js");
/* harmony import */ var _Corridor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Corridor */ "./dist/esm/data/Corridor.js");
/* harmony import */ var _Zone__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Zone */ "./dist/esm/data/Zone.js");
/* harmony import */ var _VerticalPassage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./VerticalPassage */ "./dist/esm/data/VerticalPassage.js");
/* harmony import */ var _Elevator__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Elevator */ "./dist/esm/data/Elevator.js");
/* harmony import */ var _GeospatialAccuracy__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./GeospatialAccuracy */ "./dist/esm/data/GeospatialAccuracy.js");









//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./dist/esm/services/SymbolicSpaceService.js":
/*!***************************************************!*\
  !*** ./dist/esm/services/SymbolicSpaceService.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SymbolicSpaceService": () => (/* binding */ SymbolicSpaceService)
/* harmony export */ });
/* harmony import */ var _openhps_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openhps/core */ "@openhps/core");

class SymbolicSpaceService extends _openhps_core__WEBPACK_IMPORTED_MODULE_0__.DataObjectService {
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
//# sourceMappingURL=SymbolicSpaceService.js.map

/***/ }),

/***/ "./dist/esm/services/index.js":
/*!************************************!*\
  !*** ./dist/esm/services/index.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SymbolicSpaceService": () => (/* reexport safe */ _SymbolicSpaceService__WEBPACK_IMPORTED_MODULE_0__.SymbolicSpaceService)
/* harmony export */ });
/* harmony import */ var _SymbolicSpaceService__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SymbolicSpaceService */ "./dist/esm/services/SymbolicSpaceService.js");

//# sourceMappingURL=index.js.map

/***/ }),

/***/ "@openhps/core":
/*!***************************************!*\
  !*** external "./openhps-core.es.js" ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var y = x => () => x
module.exports = x({ ["Absolute2DPosition"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.Absolute2DPosition, ["AbsolutePosition"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.AbsolutePosition, ["Accuracy"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.Accuracy, ["AngleUnit"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.AngleUnit, ["DataObjectService"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.DataObjectService, ["DataSerializer"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.DataSerializer, ["Euler"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.Euler, ["GeographicalPosition"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.GeographicalPosition, ["LengthUnit"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.LengthUnit, ["ReferenceSpace"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.ReferenceSpace, ["SerializableArrayMember"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.SerializableArrayMember, ["SerializableMapMember"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.SerializableMapMember, ["SerializableMember"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.SerializableMember, ["SerializableObject"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.SerializableObject, ["Vector2"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.Vector2, ["Vector3"]: () => __WEBPACK_EXTERNAL_MODULE__openhps_core_es_js_870a26f4__.Vector3 });

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!***************************!*\
  !*** ./dist/esm/index.js ***!
  \***************************/
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Building": () => (/* reexport safe */ _data__WEBPACK_IMPORTED_MODULE_0__.Building),
/* harmony export */   "Corridor": () => (/* reexport safe */ _data__WEBPACK_IMPORTED_MODULE_0__.Corridor),
/* harmony export */   "Elevator": () => (/* reexport safe */ _data__WEBPACK_IMPORTED_MODULE_0__.Elevator),
/* harmony export */   "Floor": () => (/* reexport safe */ _data__WEBPACK_IMPORTED_MODULE_0__.Floor),
/* harmony export */   "GeospatialAccuracy": () => (/* reexport safe */ _data__WEBPACK_IMPORTED_MODULE_0__.GeospatialAccuracy),
/* harmony export */   "Room": () => (/* reexport safe */ _data__WEBPACK_IMPORTED_MODULE_0__.Room),
/* harmony export */   "SymbolicSpace": () => (/* reexport safe */ _data__WEBPACK_IMPORTED_MODULE_0__.SymbolicSpace),
/* harmony export */   "VerticalPassage": () => (/* reexport safe */ _data__WEBPACK_IMPORTED_MODULE_0__.VerticalPassage),
/* harmony export */   "Zone": () => (/* reexport safe */ _data__WEBPACK_IMPORTED_MODULE_0__.Zone),
/* harmony export */   "SymbolicSpaceService": () => (/* reexport safe */ _services__WEBPACK_IMPORTED_MODULE_1__.SymbolicSpaceService)
/* harmony export */ });
/* harmony import */ var _data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data */ "./dist/esm/data/index.js");
/* harmony import */ var _services__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./services */ "./dist/esm/services/index.js");


//# sourceMappingURL=index.js.map
})();

var __webpack_exports__Building = __webpack_exports__.Building;
var __webpack_exports__Corridor = __webpack_exports__.Corridor;
var __webpack_exports__Elevator = __webpack_exports__.Elevator;
var __webpack_exports__Floor = __webpack_exports__.Floor;
var __webpack_exports__GeospatialAccuracy = __webpack_exports__.GeospatialAccuracy;
var __webpack_exports__Room = __webpack_exports__.Room;
var __webpack_exports__SymbolicSpace = __webpack_exports__.SymbolicSpace;
var __webpack_exports__SymbolicSpaceService = __webpack_exports__.SymbolicSpaceService;
var __webpack_exports__VerticalPassage = __webpack_exports__.VerticalPassage;
var __webpack_exports__Zone = __webpack_exports__.Zone;
export { __webpack_exports__Building as Building, __webpack_exports__Corridor as Corridor, __webpack_exports__Elevator as Elevator, __webpack_exports__Floor as Floor, __webpack_exports__GeospatialAccuracy as GeospatialAccuracy, __webpack_exports__Room as Room, __webpack_exports__SymbolicSpace as SymbolicSpace, __webpack_exports__SymbolicSpaceService as SymbolicSpaceService, __webpack_exports__VerticalPassage as VerticalPassage, __webpack_exports__Zone as Zone };

//# sourceMappingURL=openhps-geospatial.es.js.map
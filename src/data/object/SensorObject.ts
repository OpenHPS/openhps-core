import 'reflect-metadata';
import { DataObject } from "./DataObject";
import { AngleUnit, Unit } from "../../utils/unit";
import { SerializableObject, SerializableMember, SerializableArrayMember } from '../decorators';

@SerializableObject()
export class SensorObject extends DataObject {
    @SerializableArrayMember(Number)
    private _horizontalFOV: number[];
    @SerializableMember({
        serializer: <U extends Unit>(object: U) => {
            // tslint:disable-next-line
            return { to: object.to.toString(), from: object.from.toString() };
        },
        deserializer: (json: { to: string, from: string}) => {
            // tslint:disable-next-line
            return new AngleUnit(eval(json.to), eval(json.from));
        }
    })
    private _horizontalFOVUnit: AngleUnit = AngleUnit.DEGREES;
    @SerializableArrayMember(Number)
    private _verticalFOV: number[];
    @SerializableMember({
        serializer: <U extends Unit>(object: U) => {
            // tslint:disable-next-line
            return { to: object.to.toString(), from: object.from.toString() };
        },
        deserializer: (json: { to: string, from: string}) => {
            // tslint:disable-next-line
            return new AngleUnit(eval(json.to), eval(json.from));
        }
    })
    private _verticalFOVUnit: AngleUnit = AngleUnit.DEGREES;

    constructor(uid?: string) {
        super(uid);
    }

    public merge(object: SensorObject): SensorObject {
        super.merge(object);
        if (object.horizontalFOV !== undefined)
            this._horizontalFOV = object._horizontalFOV;
        if (object.verticalFOV !== undefined)
            this._verticalFOV = object._verticalFOV;
        return this;
    }

    /**
     * Get horizontal field of view of sensor
     */
    public get horizontalFOV(): number[] {
        return this._horizontalFOV;
    }

    /**
     * Set horizontal field of view of sensor
     * @param fov Field of view
     */
    public set horizontalFOV(fov: number[]) {
        this._horizontalFOV = fov;
    }

    public get horizontalFOVUnit(): AngleUnit {
        return this._horizontalFOVUnit;
    }

    public set horizontalFOVUnit(unit: AngleUnit) {
        this._horizontalFOVUnit = unit;
    }

    public get verticalFOV(): number[] {
        return this._verticalFOV;
    }

    public set verticalFOV(fov: number[]) {
        this._verticalFOV = fov;
    }

    public get verticalFOVUnit(): AngleUnit {
        return this._verticalFOVUnit;
    }

    public set verticalFOVUnit(unit: AngleUnit) {
        this._verticalFOVUnit = unit;
    }

}

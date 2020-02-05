import { SerializableObject, SerializableMember } from "../../data/decorators";
import * as crypto from 'crypto';

@SerializableObject({
    initializer: (sourceObject: Unit, rawSourceObject: Unit) => {
        if (rawSourceObject._hash !== undefined) {
            return Unit.findUnitByHash(rawSourceObject._hash);
        }
        return new Unit();
    }
})
export class Unit {
    private _toReference: (x: number) => number;
    private _fromReference: (x: number) => number;
    @SerializableMember()
    private _hash: string;

    private static _units: Map<string, Unit> = new Map();


    /**
     * Create a new unit
     * @param toReference Lambda function to convert 'x' to the reference unit 
     * @param fromReference Lambda function to convert 'x' from the reference unit to the newly created unit
     */
    constructor(toReference: (x: number) => number = (x) => x, fromReference: (x: number) => number = (x) => x) {
        this._toReference = toReference;
        this._fromReference = fromReference;

        this._hash = crypto.createHash('md5').update(`${this.constructor.name}${this._toReference.toString()}${this._fromReference.toString()}`).digest("hex");

        Unit._units.set(this.hash, this);
    }

    public get hash(): string {
        return this._hash;
    }

    public static findUnitByHash(hash: string): Unit {
        return Unit._units.get(hash);
    }

    /**
     * Convert a value in the current unit to a target unit
     */
    public convert(value: number, targetUnit: Unit): number {
        const currentValue = this.to(value);
        const targetValue = targetUnit.from(currentValue);
        return targetValue;
    }

    public get to(): (x: number) => number {
        return this._toReference;
    }

    public get from(): (x: number) => number {
        return this._fromReference;
    }
}

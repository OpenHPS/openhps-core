import 'reflect-metadata';
import { SerializableObject, SerializableMember } from "../../data/decorators";

@SerializableObject({
    initializer: <T extends Unit | Unit>(_: T, rawSourceObject: T) => {
        if (rawSourceObject.hash !== undefined) {
            const unit = Unit.findUnitByHash(rawSourceObject.hash);
            if (unit === undefined) {
                throw new Error(`Unit with hash ${rawSourceObject.hash} not found! Unable to deserialize!`);
            }
            return unit;
        } else {
            throw new Error(`Unit does not define a serialization hash! Unable to deserialize!`);
        }
    }
})
export class Unit {
    private _toReference: (x: number) => number;
    private _fromReference: (x: number) => number;
    private _hash: number;

    private static _units: Map<number, Unit> = new Map();

    /**
     * Create a new unit
     * @param toReference Lambda function to convert 'x' to the reference unit 
     * @param fromReference Lambda function to convert 'x' from the reference unit to the newly created unit
     */
    constructor(toReference?: (x: number) => number, fromReference?: (x: number) => number) {
        this._toReference = toReference;
        this._fromReference = fromReference;

        if (toReference !== undefined && fromReference !== undefined) {
            const str = `${this.constructor.name}${this._toReference.toString()}${this._fromReference.toString()}`;
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                // tslint:disable-next-line
                hash = ((hash << 5) - hash) + char;
                // tslint:disable-next-line
                hash = hash & hash; // Convert to 32bit integer
            }
            this._hash = hash;

            if (!Unit._units.has(this.hash)) {
                Unit._units.set(this.hash, this);
            }
        }
    }

    @SerializableMember()
    public get hash(): number {
        return this._hash;
    }

    public set hash(hash: number) {
        if (this._hash === undefined) {
            const existingUnit = Unit.findUnitByHash(hash);
            if (existingUnit !== undefined) {
                this._toReference = existingUnit._toReference;
                this._fromReference = existingUnit._fromReference;
                this._hash = hash;
            }
        }
    }

    /**
     * Find a unit by a hash number
     * @param hash Hash number
     */
    public static findUnitByHash(hash: number): Unit {
        return Unit._units.get(hash);
    }

    /**
     * Convert a value in the current unit to a target unit
     * 
     * @param value value to convert
     * @param targetUnit target unit
     */
    public convert(value: number, targetUnit: Unit): number {
        // Do not convert if target unit is the same
        if (targetUnit.hash === this.hash) {
            return value;
        }
        
        const currentValue = this.to(value);
        const targetValue = targetUnit.from(currentValue);
        return targetValue;
    }

    protected get to(): (x: number) => number {
        return this._toReference;
    }

    protected get from(): (x: number) => number {
        return this._fromReference;
    }
}

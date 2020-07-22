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
    private _hash: string;

    private static _units: Map<string, Unit> = new Map();

    /**
     * Create a new unit
     * @param toReference Lambda function to convert 'x' to the reference unit 
     * @param fromReference Lambda function to convert 'x' from the reference unit to the newly created unit
     */
    constructor(toReference?: (x: number) => number, fromReference?: (x: number) => number) {
        this._toReference = toReference;
        this._fromReference = fromReference;

        if (toReference !== undefined && fromReference !== undefined) {
            this._hash = Buffer.from(`${this.constructor.name}${this._toReference.toString()}${this._fromReference.toString()}`).toString('base64');

            if (!Unit._units.has(this.hash)) {
                Unit._units.set(this.hash, this);
            }
        }
    }

    @SerializableMember()
    public get hash(): string {
        return this._hash;
    }

    public set hash(hash: string) {
        if (this._hash === undefined) {
            const existingUnit = Unit.findUnitByHash(hash);
            if (existingUnit !== undefined) {
                this._toReference = existingUnit._toReference;
                this._fromReference = existingUnit._fromReference;
                this._hash = hash;
            }
        }
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

    protected get to(): (x: number) => number {
        return this._toReference;
    }

    protected get from(): (x: number) => number {
        return this._fromReference;
    }
}

export abstract class Unit {
    private _toReference: (x: number) => number;
    private _fromReference: (x: number) => number;

    /**
     * Create a new unit
     * @param toReference Lambda function to convert 'x' to the reference unit 
     * @param fromReference Lambda function to convert 'x' from the reference unit to the newly created unit
     */
    protected constructor(toReference: (x: number) => number, fromReference: (x: number) => number) {
        this._toReference = toReference;
        this._fromReference = fromReference;
    }

    /**
     * Convert a value in the current unit to a target unit
     */
    public convert(value: number, targetUnit: Unit): number {
        const currentValue = this._toReference(value);
        const targetValue = targetUnit._fromReference(currentValue);
        return targetValue;
    }
}

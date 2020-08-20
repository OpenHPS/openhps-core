import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';
import { UnitOptions } from './UnitOptions';

@SerializableObject()
export class DerivedUnit extends Unit {
    private _units: Map<string, Unit> = new Map();
    private _unitPower: Map<string, number> = new Map();

    public addUnit(unit: Unit, power: number): DerivedUnit {
        if (this._units.has(unit.baseName)) {
            throw new Error(`A unit with base name '${unit.baseName}' already exists for this unit!`);
        }
        this._units.set(unit.baseName, unit);
        this._unitPower.set(unit.baseName, power);
        return this;
    }

    public swap(subunits: Unit[], options?: UnitOptions): DerivedUnit {
        if (Unit.UNITS.has(options.name)) {
            return Unit.UNITS.get(options.name) as this;
        }

        const UnitConstructor = Object.getPrototypeOf(this).constructor;
        const unit = new UnitConstructor();
        unit._name = options.name;
        unit._baseName = this.baseName;
        unit._aliases = options.aliases ? options.aliases : [];
        const definition = {
            unit: this.name,
            magnitude: 1,
            offset: 0,
        };

        subunits.forEach((subunit) => {
            const currentUnit: Unit = this._units.get(subunit.baseName);
            const unitPower: number = this._unitPower.get(subunit.baseName);
            const newDefinition = subunit.createDefinition(currentUnit);
            const newMagnitude = Math.pow(newDefinition.magnitude, unitPower);
            const newOffset = Math.pow(newDefinition.offset, unitPower);
            definition.magnitude *= isFinite(newMagnitude) ? newMagnitude : 0;
            definition.offset += isFinite(newOffset) ? newOffset : 0;
        });

        unit._definitions.set(this.name, definition);
        return Unit.registerUnit(unit) as this;
    }
}

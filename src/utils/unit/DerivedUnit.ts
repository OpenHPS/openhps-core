import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';
import { UnitOptions } from './UnitOptions';
import { UnitFunctionDefinition } from './UnitDefinition';

/**
 * Derived Unit
 *
 * @category Unit
 */
@SerializableObject()
export class DerivedUnit extends Unit {
    private _units: Map<string, Unit> = new Map();
    private _unitPower: Map<string, number> = new Map();

    addUnit(unit: Unit, power: number): DerivedUnit {
        if (this._units.has(unit.baseName)) {
            throw new Error(`A unit with base name '${unit.baseName}' already exists for this unit!`);
        }
        this._units.set(unit.baseName, unit);
        this._unitPower.set(unit.baseName, power);
        return this;
    }

    swap(subunits: Unit[], options?: UnitOptions): DerivedUnit {
        if (Unit.UNITS.has(options.name)) {
            return Unit.UNITS.get(options.name) as this;
        }

        const UnitConstructor = Object.getPrototypeOf(this).constructor;
        const unit = new UnitConstructor();
        unit._name = options.name;
        unit._baseName = this.baseName;
        unit._aliases = options.aliases ? options.aliases : [];
        const definition: UnitFunctionDefinition<any, any> = {
            unit: this.name,
            toUnit: undefined,
            fromUnit: undefined,
        };

        subunits.forEach((subunit) => {
            const currentUnit: Unit = this._units.get(subunit.baseName);
            const unitPower: number = this._unitPower.get(subunit.baseName);
            const newDefinition = subunit.createDefinition(currentUnit);

            const newToFn = (value: number) => Math.pow(newDefinition.toUnit(value) as number, unitPower);
            const newFromFn = (value: number) => Math.pow(newDefinition.fromUnit(value) as number, unitPower);

            const existingToFn = definition.toUnit;
            const existingFromFn = definition.fromUnit;

            if (existingToFn && existingFromFn) {
                definition.toUnit = (value: number) => existingToFn(newToFn(value));
                definition.fromUnit = (value: number) => existingFromFn(newFromFn(value));
            } else {
                definition.toUnit = newToFn;
                definition.fromUnit = newFromFn;
            }
        });

        unit._definitions.set(this.name, definition);
        return Unit.registerUnit(unit) as this;
    }
}

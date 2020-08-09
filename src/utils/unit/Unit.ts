import 'reflect-metadata';
import { SerializableObject, SerializableMember } from "../../data/decorators";
import { UnitOptions } from './UnitOptions';
import { UnitDefinition } from './UnitDefinition';
import { UnitPrefix, UnitPrefixType } from './UnitPrefix';

@SerializableObject({
    initializer: <T extends Unit | Unit>(_: T, rawSourceObject: T) => {
        if (rawSourceObject.name !== undefined) {
            const unit = Unit.findByName(rawSourceObject.name);
            if (unit === undefined) {
                throw new Error(`Unit with name '${rawSourceObject.name}' not found! Unable to deserialize!`);
            }
            return unit;
        } else {
            throw new Error(`Unit does not define a serialization name! Unable to deserialize!`);
        }
    }
})
export class Unit {
    private _name: string;
    private _baseName: string;
    private _definitions: Map<string, UnitDefinition> = new Map();
    private _prefixType: UnitPrefixType = 'none';
    private _aliases: string[] = new Array();

    // Unit bases (e.g. length, time, velocity, ...)
    private static readonly UNIT_BASES: Map<string, string> = new Map();
    // Units (e.g. second, meter, ...)
    private static readonly UNITS: Map<string, Unit> = new Map();

    /**
     * Create a new unit
     * @param options Unit options
     */
    constructor(name?: string, options?: UnitOptions) {
        const config: UnitOptions = options || { baseName: undefined };
        config.aliases = config.aliases ? config.aliases : [];
        config.prefixes = config.prefixes ? config.prefixes : 'none';
        config.definitions = config.definitions ? config.definitions : [];

        // Unit config
        this._name = name;
        this._baseName = config.baseName;
        this._aliases = config.aliases;
        this._prefixType = config.prefixes;

        // Unit definitions
        config.definitions.forEach(definition => {
            const referenceUnit = Unit.findByName(definition.unit);
            if (referenceUnit) {
                this._definitions.set(referenceUnit.name, {
                    unit: definition.unit,
                    magnitude: definition.magnitude ? definition.magnitude : 1,
                    offset: definition.offset ? definition.offset : 0
                });
            }
        });

        Unit.registerUnit(this, config.override);
    }

    @SerializableMember()
    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
        const existingUnit = Unit.findByName(name);
        if (existingUnit) {
            this._baseName = existingUnit.baseName;
            this._definitions = existingUnit._definitions;
            this._prefixType = existingUnit._prefixType;
            this._aliases = existingUnit._aliases;
        }
    }

    public get aliases(): string[] {
        return this._aliases;
    }

    public get baseName(): string {
        return this._baseName;
    }

    public get prefixType(): UnitPrefixType {
        return this._prefixType;
    }

    public get definitions(): UnitDefinition[] {
        return Array.from(this._definitions.values());
    }

    protected get prefixes(): UnitPrefix[] {
        switch (this._prefixType) {
            case 'decimal':
                return UnitPrefix.DECIMAL;
            case 'none':
                return [];
        }
    }

    public specifier(prefix: UnitPrefix): this {
        // Check if the unit already exists
        const unitName = `${prefix.name}${this.name}`;
        if (Unit.UNITS.has(unitName)) {
            return Unit.UNITS.get(unitName) as this;
        }

        // Confirm that the prefix is allowed
        if (!this.prefixes.includes(prefix))
            throw new Error(`Prefix '${prefix.name}' is not allowed for this unit!`);

        // Get the unit constructor of the extended class. This allows
        // serializing of units that are extended (e.g. LengthUnit)
        const UnitConstructor = Object.getPrototypeOf(this).constructor;
        const unit = new UnitConstructor();
        unit._name = unitName;
        unit._baseName = this.baseName;
        const aliases = new Array();
        this.aliases.forEach(alias => {
            aliases.push(`${prefix.name}${alias}`);
            aliases.push(`${prefix.abbrevation}${alias}`);
        });
        unit._aliases = aliases;
        unit._definitions.set(this.name, {
            unit: this.name,
            magnitude: prefix.magnitude,
            offset: 0
        });
        return Unit.registerUnit(unit) as this;
    }

    /**
     * Find a unit by its name
     * @param name Unit name
     * @param baseName Optional base name to specific result
     */
    public static findByName(name: string, baseName?: string): Unit {
        if (name === undefined) {
            return undefined;
        } else if (Unit.UNITS.has(name)) {
            return Unit.UNITS.get(name);
        } else {
            // Check all units
            for (const [unitName, unit] of Unit.UNITS) {
                if (baseName ? baseName !== unit.baseName : false) {
                    continue;
                }

                // Check all aliases in those units
                for (const alias of unit.aliases.concat(unitName)) {
                    if (name === alias) {
                        // Exact match with alias
                        return unit;
                    } else if (name.endsWith(alias)) {
                        // Unit that we are looking for ends with the alias
                        // confirm that there is a prefix match
                        for (const prefix of unit.prefixes) {
                            if (name.match(prefix.abbrevationPattern) || name.match(prefix.namePattern)) {
                                return unit.specifier(prefix);
                            }
                        }
                    }
                }
            }
            return undefined;
        }
    }

    /**
     * Convert a value in the current unit to a target unit
     * 
     * @param value Value to convert
     * @param target Target unit
     */
    public convert(value: number, target: string | Unit): number {
        const targetUnit: Unit = typeof target === 'string' ? Unit.findByName(target, this.baseName) : target;
        
        // Do not convert if target unit is the same or undefined
        if (!targetUnit || targetUnit.name === this.name) {
            return value;
        }

        if (this._definitions.has(targetUnit.name)) {
            const definition = this._definitions.get(targetUnit.name);
            return (value * definition.magnitude) + definition.offset;
        } else if (targetUnit._definitions.has(this.name)) {
            const definition = targetUnit._definitions.get(this.name);
            return (value / definition.magnitude) - definition.offset;
        } else {
            // No direct conversion found, convert to base unit
            const baseUnitName = Unit.UNIT_BASES.get(this.baseName);
            const definitionToBase = this._definitions.get(baseUnitName);
            const definitionFromBase = targetUnit._definitions.get(baseUnitName);
            // Unable to convert unit
            if (!definitionToBase || !definitionFromBase) {
                return value;
            }
            return (((value * definitionToBase.magnitude) + definitionToBase.offset) / definitionFromBase.magnitude) - definitionFromBase.offset;
        }
    }

    public static convert(value: number, from: string | Unit, to: string | Unit): number {
        const fromUnit: Unit = typeof from === 'string' ? Unit.findByName(from) : from;
        return fromUnit.convert(value, to);
    }

    public static registerUnit(unit: Unit, override: boolean = false): Unit {
        if (!unit.name) {
            return unit;
        }

        // Register unit if it does not exist yet
        if (!Unit.UNITS.has(unit.name) || override) {
            Unit.UNITS.set(unit.name, unit);
        }
        // Check if the unit is a new base unit
        const baseName = unit.baseName ? unit.baseName : unit.name;
        if (!Unit.UNIT_BASES.has(baseName)) {
            Unit.UNIT_BASES.set(baseName, unit.name);
        }
        return unit;
    }
    
}

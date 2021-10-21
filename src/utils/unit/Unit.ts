import 'reflect-metadata';
import { SerializableObject, SerializableMember } from '../../data/decorators';
import { UnitOptions } from './UnitOptions';
import { UnitBasicDefinition, UnitDefinition, UnitFunctionDefinition } from './UnitDefinition';
import { UnitPrefix, UnitPrefixType } from './UnitPrefix';
import { Vector3 } from '../math/Vector3';

/**
 * Unit
 *
 * ## Usage
 * ### Creation
 * ```typescript
 * const myUnit = new Unit("meter", {
 *  baseName: "length",
 *  aliases: ["m", "meters"],
 *  prefixes: 'decimal'
 * })
 * ```
 *
 * ### Specifiers
 * You can specify the prefix using the ```specifier(...)``` function.
 * ```typescript
 * const nanoUnit = myUnit.specifier(UnitPrefix.NANO);
 * ```
 *
 * @category Unit
 */
@SerializableObject({
    initializer: Unit.fromJSON,
})
export class Unit {
    private _name: string;
    private _baseName: string;
    private _definitions: Map<string, UnitFunctionDefinition<any, any>> = new Map();
    private _prefixType: UnitPrefixType = 'none';
    private _aliases: string[] = [];

    // Unit bases (e.g. length, time, velocity, ...)
    protected static readonly UNIT_BASES: Map<string, string> = new Map();
    // Units (e.g. second, meter, ...)
    protected static readonly UNITS: Map<string, Unit> = new Map();

    static readonly UNKNOWN = new Unit('unknown');

    /**
     * Create a new unit
     *
     * @param {string} name Unit name
     * @param {UnitOptions} options Unit options
     */
    constructor(name?: string, options?: UnitOptions) {
        const config: UnitOptions = options || { baseName: undefined };
        config.aliases = config.aliases || [];
        config.prefixes = config.prefixes || 'none';
        config.definitions = config.definitions || [];

        // Unit config
        this._name = name || config.name;
        this._baseName = config.baseName;
        this._aliases = config.aliases;
        this._prefixType = config.prefixes;

        // Unit definitions
        config.definitions.forEach(this._initDefinition.bind(this));

        if (this.name) {
            Unit.registerUnit(this, config.override);
        }
    }

    /**
     * Get a unit from JSON
     *
     * @param {any} json JSON object
     * @returns {Unit} Unit if found
     */
    static fromJSON<T extends Unit | Unit>(json: any): T {
        if (json.name !== undefined) {
            const unit = Unit.findByName(json.name);
            if (!unit) {
                throw new Error(`Unit with name '${json.name}' not found! Unable to deserialize!`);
            }
            return unit as T;
        } else {
            throw new Error(`Unit does not define a serialization name! Unable to deserialize!`);
        }
    }

    private _initDefinition(definition: UnitDefinition): void {
        const referenceUnit = Unit.findByName(definition.unit, this.baseName);
        const unitName = referenceUnit ? referenceUnit.name : definition.unit;

        if ('toUnit' in definition) {
            // UnitFunctionDefinition
            this._initFunctionDefinition(definition, unitName);
        } else {
            // UnitBasicDefinition
            this._initBasicDefinition(definition, unitName);
        }
    }

    private _initFunctionDefinition(definition: UnitDefinition, unitName: string): void {
        const functionDefinition = definition as UnitFunctionDefinition<any, any>;
        this._definitions.set(unitName, functionDefinition);
    }

    private _initBasicDefinition(definition: UnitDefinition, unitName: string): void {
        const definitionKeys = Object.keys(definition);
        const basicDefinition: UnitBasicDefinition = definition;
        const magnitudeOrder = definitionKeys.indexOf('magnitude');
        const offsetOrder = definitionKeys.indexOf('offset');
        const magnitude = basicDefinition.magnitude || 1;
        const offset = basicDefinition.offset !== undefined ? basicDefinition.offset : 0;
        const offsetPriority = magnitudeOrder === -1 ? true : offsetOrder < magnitudeOrder;

        let toUnitFn: (value: number) => number;
        let fromUnitFn: (value: number) => number;

        if (offsetPriority) {
            toUnitFn = (value: number) => (value + offset) * magnitude;
            fromUnitFn = (value: number) => value / magnitude - offset;
        } else {
            toUnitFn = (value: number) => value * magnitude + offset;
            fromUnitFn = (value: number) => (value - offset) / magnitude;
        }

        this._definitions.set(unitName, {
            unit: basicDefinition.unit,
            toUnit: toUnitFn,
            fromUnit: fromUnitFn,
        });
    }

    /**
     * Unit name
     *
     * @returns {string} Name
     */
    @SerializableMember()
    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
        const existingUnit = Unit.findByName(name);
        if (existingUnit) {
            this._baseName = existingUnit.baseName;
            this._definitions = existingUnit._definitions;
            this._prefixType = existingUnit._prefixType;
            this._aliases = existingUnit._aliases;
        }
    }

    /**
     * Unit aliases
     *
     * @returns {string[]} Alias names as array
     */
    get aliases(): string[] {
        return this._aliases;
    }

    get baseName(): string {
        return this._baseName;
    }

    get prefixType(): UnitPrefixType {
        return this._prefixType;
    }

    get definitions(): UnitDefinition[] {
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

    /**
     * Get or create a definition from this unit to the base
     *
     * @returns {UnitFunctionDefinition} Definition to base
     */
    createBaseDefinition(): UnitFunctionDefinition<any, any> {
        let newDefinition: UnitFunctionDefinition<any, any>;

        // Get base unit
        const baseUnitName = Unit.UNIT_BASES.get(this.baseName);

        if (this._definitions.has(baseUnitName)) {
            const definition = this._definitions.get(baseUnitName);
            newDefinition = definition;
        } else {
            this._definitions.forEach((definition) => {
                const unit = Unit.findByName(definition.unit, this.baseName);
                const baseDefinition = unit.createBaseDefinition();

                if (baseDefinition) {
                    newDefinition = {
                        unit: baseDefinition.unit,
                        toUnit: (value: any) => baseDefinition.toUnit(definition.toUnit(value)),
                        fromUnit: (value: any) => definition.fromUnit(baseDefinition.fromUnit(value)),
                    };
                    return;
                }
            });
        }
        return newDefinition;
    }

    createDefinition(targetUnit: Unit): UnitFunctionDefinition<any, any> {
        let newDefinition: UnitFunctionDefinition<any, any>;

        // Get base unit
        const baseUnitName = Unit.UNIT_BASES.get(this.baseName);
        const baseUnit = Unit.findByName(baseUnitName);

        if (this._definitions.has(targetUnit.name)) {
            // Direct conversion
            const definition = this._definitions.get(targetUnit.name);
            newDefinition = definition;
        } else if (targetUnit._definitions.has(this.name)) {
            // Reverse conversion
            const definition = targetUnit._definitions.get(this.name);
            newDefinition = {
                unit: targetUnit.name,
                toUnit: definition.fromUnit,
                fromUnit: definition.toUnit,
            };
            this._definitions.set(targetUnit.name, newDefinition);
        } else if (baseUnit.name !== this.name) {
            // No direct conversion found, convert to base unit
            const currentToBase = this._definitions.get(baseUnitName);
            const baseToTarget = baseUnit.createDefinition(targetUnit);

            // Convert unit if definitions are found
            if (currentToBase && baseToTarget) {
                newDefinition = {
                    unit: targetUnit.name,
                    toUnit: (value: any) => baseToTarget.toUnit(currentToBase.toUnit(value)),
                    fromUnit: (value: any) => currentToBase.fromUnit(baseToTarget.fromUnit(value)),
                };
                this._definitions.set(targetUnit.name, newDefinition);
            }
        }
        return newDefinition;
    }

    /**
     * Get the unit specifier
     *
     * @param {UnitPrefix} prefix Unit prefix
     * @returns {Unit} Unit with specifier
     */
    specifier(prefix: UnitPrefix): this {
        // Check if the unit already exists
        const unitName = `${prefix.name}${this.name}`;
        if (Unit.UNITS.has(unitName)) {
            return Unit.UNITS.get(unitName) as this;
        }

        // Confirm that the prefix is allowed
        if (!this.prefixes.includes(prefix)) throw new Error(`Prefix '${prefix.name}' is not allowed for this unit!`);

        // Get the unit constructor of the extended class. This allows
        // serializing of units that are extended (e.g. LengthUnit)
        const UnitConstructor = Object.getPrototypeOf(this).constructor;
        const unit: Unit = new UnitConstructor();
        unit._name = unitName;
        unit._baseName = this.baseName;
        const aliases: Array<string> = [];
        this.aliases.forEach((alias) => {
            aliases.push(`${prefix.name}${alias}`);
            aliases.push(`${prefix.abbrevation}${alias}`);
        });
        unit._aliases = aliases;
        unit._definitions.set(this.name, {
            unit: this.name,
            toUnit: (value: number) => value * prefix.magnitude,
            fromUnit: (value: number) => value / prefix.magnitude,
        });
        return Unit.registerUnit(unit) as this;
    }

    /**
     * Find unit specifier by name or alias
     *
     * @param {string} name Unit name
     * @returns {Unit} Unit if found
     */
    protected findByName(name: string): Unit {
        // Check all aliases in those units
        for (const alias of this.aliases.concat(this.name)) {
            if (name === alias) {
                // Exact match with alias
                return this;
            } else if (name.endsWith(alias)) {
                // Unit that we are looking for ends with the alias
                // confirm that there is a prefix match
                for (const prefix of this.prefixes) {
                    if (name.match(prefix.abbrevationPattern) || name.match(prefix.namePattern)) {
                        return this.specifier(prefix);
                    }
                }
            }
        }
    }

    /**
     * Find a unit by its name
     *
     * @param {string} name Unit name
     * @param {string} baseName Optional base name to specific result
     * @returns {Unit} Unit if found
     */
    static findByName(name: string, baseName?: string): Unit {
        if (name === undefined) {
            return undefined;
        } else if (Unit.UNITS.has(name)) {
            return Unit.UNITS.get(name);
        } else {
            // Check all units
            for (const [, unit] of Unit.UNITS) {
                if (baseName ? baseName !== unit.baseName : false) {
                    continue;
                }
                // Check all aliases in those units
                const result = unit.findByName(name);
                if (result) {
                    return result;
                }
            }
            return undefined;
        }
    }

    /**
     * Convert a value in the current unit to a target unit
     *
     * @param {UnitValueType} value Value to convert
     * @param {string | Unit} target Target unit
     * @returns {number} Converted unit
     */
    convert<T extends UnitValueType>(value: T, target: string | Unit): T {
        const targetUnit: Unit = target instanceof Unit ? target : Unit.findByName(target, this.baseName);

        // Do not convert if target unit is the same or undefined
        if (!targetUnit || targetUnit.name === this.name) {
            return value;
        }

        const definition = this.createDefinition(targetUnit);
        if (!definition) {
            throw new Error(`No conversion definition found from '${this.name}' to '${targetUnit.name}'!`);
        } else {
            return definition.toUnit(value) as T;
        }
    }

    /**
     * Convert a value from a specific unit to a target unit
     *
     * @param {UnitValueType} value Value to convert
     * @param {string | Unit} from Source unit
     * @param {string | Unit} to Target unit
     * @returns {UnitValueType} Converted unit
     */
    static convert<T extends UnitValueType>(value: T, from: string | Unit, to: string | Unit): T {
        const fromUnit: Unit = typeof from === 'string' ? Unit.findByName(from) : from;
        return fromUnit.convert(value, to);
    }

    /**
     * Register a new unit
     *
     * @param {Unit} unit Unit to register
     * @param {boolean} override Override an existing unit with the same name
     * @returns {Unit} Registered unit
     */
    static registerUnit(unit: Unit, override = false): Unit {
        if (!unit.name) {
            return unit;
        }

        // Register unit if it does not exist yet
        if (!Unit.UNITS.has(unit.name) || override) {
            Unit.UNITS.set(unit.name, unit);
        }
        // Check if the unit is a new base unit
        const baseName = unit.baseName ? unit.baseName : unit.name;
        const baseUnitName = Unit.UNIT_BASES.get(baseName);
        if (!baseUnitName) {
            Unit.UNIT_BASES.set(baseName, unit.name);
        } else {
            // Confirm that the unit can be converted to a base unit
            const baseUnit = Unit.findByName(baseUnitName, baseName);
            const fromBase = baseUnit.createDefinition(unit);
            const toBase = unit.createBaseDefinition();
            if (!fromBase) {
                // No conversion definition
                unit._definitions.set(baseUnitName, toBase);
            }
        }
        return unit;
    }
}

export type UnitValueType = number | Vector3 | number;

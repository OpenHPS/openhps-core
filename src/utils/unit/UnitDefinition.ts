import { Vector3 } from '../math/_internal';

/**
 * @category Unit
 */
export type UnitDefinition = UnitBasicDefinition | UnitFunctionDefinition;

/**
 * @category Unit
 */
export interface UnitBasicDefinition {
    /**
     * Target unit
     */
    unit: string;
    /**
     * Conversion magnitude
     *  This is the magnitude to convert this unit to the target unit.
     */
    magnitude?: number;
    /**
     * Conversion offset
     */
    offset?: number;
    /**
     * Should offset by added first before applying the magnitude
     *  Example: Celcius to Fahrenheit vs Fahrenheit to Celcius
     */
    offsetPriority?: boolean;
}
/**
 * @category Unit
 */
export interface UnitFunctionDefinition {
    /**
     * Target unit
     */
    unit: string;
    toUnit: (x: number | Vector3) => number | Vector3;
    fromUnit: (x: number | Vector3) => number | Vector3;
}

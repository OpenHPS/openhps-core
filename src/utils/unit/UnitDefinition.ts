import { Vector3 } from '../../three/Three';

export type UnitValueType = Vector3 | number;

/**
 * @category Unit
 */
export type UnitDefinition = UnitBasicDefinition | UnitFunctionDefinition<any, any>;

/**
 * @category Unit
 */
export type UnitBasicDefinition = {
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
};

/**
 * @category Unit
 */
export type UnitFunctionDefinition<In, Out> = {
    inputType?: new (...args: any[]) => UnitValueType;
    outputType?: new (...args: any[]) => UnitValueType;
    /**
     * Target unit
     */
    unit: string;
    toUnit: (x: In) => Out;
    fromUnit: (x: Out) => In;
};

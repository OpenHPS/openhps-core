export interface UnitDefinition {
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
    offsetPriority?: boolean;
}

export interface UnitDefinition {
    /**
     * Target unit
     */
    unit: string;
    /**
     * Conversion magnitude
     */
    magnitude?: number;
    /**
     * Conversion offset
     */
    offset?: number;
    offsetPriority?: boolean;
}

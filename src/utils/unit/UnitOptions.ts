import { UnitDefinition } from './UnitDefinition';
import { UnitPrefixType } from './UnitPrefix';

/**
 * @category Unit
 */
export interface UnitOptions {
    /**
     * Base unit name
     */
    baseName: string;
    /**
     * Name of the unit
     */
    name?: string;
    /**
     * Definitions of the unit
     */
    definitions?: UnitDefinition[];
    /**
     * Optional aliases
     */
    aliases?: string[];
    /**
     * Prefix type to use
     */
    prefixes?: UnitPrefixType;
    /**
     * Override existing units with the same name
     */
    override?: boolean;
}

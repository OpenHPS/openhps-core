/**
 * @category Unit
 */
export class UnitPrefix {
    public static readonly DECA = new UnitPrefix('deca', 'da', 1e1);
    public static readonly HECTO = new UnitPrefix('hecto', 'h', 1e2);
    public static readonly KILO = new UnitPrefix('kilo', 'k', 1e3);
    public static readonly MEGA = new UnitPrefix('mega', 'M', 1e6);
    public static readonly GIGA = new UnitPrefix('giga', 'G', 1e9);
    public static readonly TERA = new UnitPrefix('tera', 'T', 1e12);
    public static readonly PETA = new UnitPrefix('peta', 'P', 1e15);
    public static readonly EXA = new UnitPrefix('exa', 'E', 1e18);
    public static readonly ZETTA = new UnitPrefix('zetta', 'Z', 1e21);
    public static readonly YOTTA = new UnitPrefix('yotta', 'Y', 1e24);
    public static readonly DECI = new UnitPrefix('deci', 'd', 1e-1);
    public static readonly CENTI = new UnitPrefix('centi', 'c', 1e-2);
    public static readonly MILLI = new UnitPrefix('milli', 'm', 1e-3);
    public static readonly MICRO = new UnitPrefix('micro', 'u', 1e-6);
    public static readonly NANO = new UnitPrefix('nano', 'n', 1e-9);
    public static readonly PICO = new UnitPrefix('pico', 'p', 1e-12);
    public static readonly FEMTO = new UnitPrefix('femto', 'f', 1e-15);
    public static readonly ATTO = new UnitPrefix('atto', 'a', 1e-18);
    public static readonly ZEPTO = new UnitPrefix('zepto', 'z', 1e-21);
    public static readonly YOCTO = new UnitPrefix('yocto', 'y', 1e-24);

    public static readonly DECIMAL: UnitPrefix[] = [
        UnitPrefix.DECA,
        UnitPrefix.HECTO,
        UnitPrefix.KILO,
        UnitPrefix.MEGA,
        UnitPrefix.GIGA,
        UnitPrefix.TERA,
        UnitPrefix.PETA,
        UnitPrefix.EXA,
        UnitPrefix.ZETTA,
        UnitPrefix.YOTTA,
        UnitPrefix.DECI,
        UnitPrefix.CENTI,
        UnitPrefix.MILLI,
        UnitPrefix.MICRO,
        UnitPrefix.NANO,
        UnitPrefix.PICO,
        UnitPrefix.FEMTO,
        UnitPrefix.ATTO,
        UnitPrefix.ZEPTO,
        UnitPrefix.YOCTO,
    ];

    public name: string;
    public abbrevation: string;
    public magnitude: number;

    private constructor(name: string, abbrevation: string, magnitude: number) {
        this.name = name;
        this.abbrevation = abbrevation;
        this.magnitude = magnitude;
    }

    public get namePattern(): RegExp {
        return new RegExp(`/^${this.name}/g`);
    }

    public get abbrevationPattern(): RegExp {
        return new RegExp(`/^${this.abbrevation}/g`);
    }
}

export type UnitPrefixType = 'decimal' | 'none';

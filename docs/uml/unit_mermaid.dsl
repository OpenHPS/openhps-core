
classDiagram


class DerivedUnit{
            -_units
-_unitPower
            +addUnit()
+swap()
        }
Unit<|--DerivedUnit
class GCS{
            +EARTH_RADIUS_MEAN$
+EARTH_EQUATORIAL_RADIUS$
+EARTH_POLAR_RADIUS$
+EARTH_ECCENTRICITY$
+EPSG4326$
+WGS84$
+ECEF$
+EPSG3857$
            
        }
Unit<|--GCS
GCS  --  GCS
class Unit{
            -_name
-_baseName
-_definitions
-_prefixType
-_aliases
#UNIT_BASES$
#UNITS$
+UNKNOWN$
            +fromJSON()$
-_initDefinition()
-_initFunctionDefinition()
-_initBasicDefinition()
+createBaseDefinition()
+createDefinition()
+specifier()
#findByName()
+findByName()$
+convert()
+convert()$
+registerUnit()$
        }
Unit  --  Unit
class UnitBasicDefinition {
            <<type>>
            +unit
+magnitude
+offset
            
        }
class UnitFunctionDefinition~In,Out~ {
            <<type>>
            +inputType
+outputType
+unit
+toUnit
+fromUnit
            
        }
class UnitOptions {
            <<interface>>
            +baseName
+name
+definitions
+aliases
+prefixes
+override
            
        }
UnitOptions  -- "0..*" UnitBasicDefinition
class UnitPrefix{
            +DECA$
+HECTO$
+KILO$
+MEGA$
+GIGA$
+TERA$
+PETA$
+EXA$
+ZETTA$
+YOTTA$
+DECI$
+CENTI$
+MILLI$
+MICRO$
+NANO$
+PICO$
+FEMTO$
+ATTO$
+ZEPTO$
+YOCTO$
+DECIMAL$
+name
+abbrevation
+magnitude
            
        }
UnitPrefix "0..*" --  UnitPrefix
class UnitValue~U,T~{
            #_value
#_unit
            +to()
+toString()
+valueOf()
+setValue()
+clone()
        }
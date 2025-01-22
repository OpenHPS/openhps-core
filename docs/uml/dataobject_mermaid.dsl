
classDiagram


class ActuatorProperty{
            +name
+callback
            
        }
class ActuatorObject{
            #properties
            +invoke()
        }
DataObject<|--ActuatorObject
class DataObject{
            +displayName
+createdTimestamp
+uid
-_position
-_relativePositions
+parentUID
            +getPosition()
+setPosition()
+setUID()
+setParent()
+removeRelativePositions()
+addRelativePosition()
+getRelativePositions()
+getRelativePosition()
+hasRelativePosition()
+bind()
+clone()
        }
class SensorCalibrationData~T~{
            +unit
+offset
+multiplier
            
        }
class SensorObject~T~{
            +value
+frequency
+calibrationData
            
        }
DataObject<|--SensorObject~T~
class ReferenceSpace{
            -_translationMatrix
-_transformationMatrix
-_scaleMatrix
-_rotation
-_unit
-_parent
            +fromDataObject()$
+update()
+orthographic()
+perspective()
+reset()
+referenceUnit()
+translation()
+scale()
+rotation()
+transform()
        }
DataObject<|--ReferenceSpace
TransformationSpace<|..ReferenceSpace
class TransformationSpace {
            <<interface>>
            +uid
+parent
            +update()
+transform()
        }
class SpaceTransformationOptions {
            <<interface>>
            +inverse
            
        }
TransformationSpace  --  TransformationSpace
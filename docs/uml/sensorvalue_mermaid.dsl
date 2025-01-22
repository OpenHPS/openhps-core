
classDiagram


class Acceleration{
            
            
        }
SensorValue~U~<|--Acceleration
class Accuracy~U,T~{
            +value
#_unit
            +to()
+valueOf()*
+toString()*
+clone()
        }
class Accuracy1D~U~{
            +value
            +valueOf()
+toString()
        }
Accuracy~U,T~<|--Accuracy1D~U~
class Accuracy2D~U~{
            +value
            +to()
+valueOf()
+toString()
        }
Accuracy~U,T~<|--Accuracy2D~U~
class Accuracy3D~U~{
            
            +to()
+valueOf()
        }
Accuracy2D~U~<|--Accuracy3D~U~
class AngularVelocity{
            +unit
            +fromArray()$
        }
SensorValue~U~<|--AngularVelocity
class Humidity{
            
            
        }
SensorValue~U~<|--Humidity
class LinearVelocity{
            +unit
            +fromArray()$
        }
SensorValue~U~<|--LinearVelocity
class Magnetism{
            +unit
            
        }
SensorValue~U~<|--Magnetism
class Pressure{
            
            
        }
SensorValue~U~<|--Pressure
class SensorValue~U~{
            +timestamp
+accuracy
-_defaultUnit
+unit
            +setAccuracy()
+toTuple()
+clone()
        }
Vector3<|--SensorValue~U~
class Temperature{
            
            
        }
SensorValue~U~<|--Temperature
class Velocity{
            +linear
+angular
            +clone()
        }
Velocity  --  LinearVelocity
Velocity  --  AngularVelocity
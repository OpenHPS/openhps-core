
classDiagram


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
class AbsoluteOrientationSensor{
            
            
        }
SensorObject~T~<|--AbsoluteOrientationSensor
class GravitySensor{
            
            
        }
SensorObject~T~<|--GravitySensor
class LinearAccelerationSensor{
            
            
        }
SensorObject~T~<|--LinearAccelerationSensor
class LinearVelocitySensor{
            
            
        }
SensorObject~T~<|--LinearVelocitySensor
class RelativeOrientationSensor{
            
            
        }
SensorObject~T~<|--RelativeOrientationSensor

classDiagram


class Absolute2DPosition{
            #vector
            +angleTo()
+fromVector()
+toVector3()
+clone()
        }
AbsolutePosition<|--Absolute2DPosition
class Absolute3DPosition{
            
            +fromVector()
+toVector3()
+clone()
        }
Absolute2DPosition<|--Absolute3DPosition
class AbsolutePosition{
            +timestamp
+velocity
+orientation
+unit
+referenceSpaceUID
-_accuracy
-_probability
            +setOrientation()
+setAccuracy()
+fromVector()*
+toVector3()*
+angleTo()*
+distanceTo()
+equals()
+clone()
        }
Position~U~<|..AbsolutePosition
AbsolutePosition  --  Orientation
class GeographicalPosition{
            
            +distanceTo()
+bearing()
+angleTo()
+destination()
+fromVector()
+toVector3()
+clone()
        }
Absolute3DPosition<|--GeographicalPosition
class Orientation{
            +timestamp
+accuracy
            +fromBearing()$
+fromQuaternion()$
+clone()
        }
Quaternion<|--Orientation
class Pose{
            +timestamp
+unit
-_accuracy
-_probability
            +fromMatrix4()$
+fromPosition()$
        }
Matrix4<|--Pose
Position~U~<|..Pose
class Position~U~ {
            <<interface>>
            +timestamp
+accuracy
+probability
            +clone()
+equals()
        }
class Relative2DPosition{
            
            +fromVector()
+toVector3()
+clone()
        }
RelativePosition~T,U~<|--Relative2DPosition
class Relative3DPosition{
            
            +fromVector()
+toVector3()
+clone()
        }
Relative2DPosition<|--Relative3DPosition
class RelativeAngle{
            +orientation
+unit
+referenceValue
            
        }
RelativePosition~T,U~<|--RelativeAngle
RelativeAngle  --  Orientation
class RelativeDistance{
            +unit
+referenceValue
            
        }
RelativePosition~T,U~<|--RelativeDistance
class RelativePosition~T,U~{
            +timestamp
+referenceObjectUID
+referenceObjectType
+referenceValue
-_accuracy
-_probability
-_defaultUnit
+unit
            +setAccuracy()
+equals()
+clone()
        }
Position~U~<|..RelativePosition~T,U~
class Trajectory{
            +uid
+objectUID
+positions
+createdTimestamp
            
        }
Trajectory  -- "0..*" AbsolutePosition
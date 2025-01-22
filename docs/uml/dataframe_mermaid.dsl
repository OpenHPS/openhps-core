
classDiagram


class DataFrame{
            +uid
+createdTimestamp
+phenomenonTimestamp
-_source
-_objects
            +getSensor()
+getObjects()
+getObjectByUID()
+hasObject()
+addObject()
+addSensor()
+addReferenceSpace()
+removeObject()
+clearObjects()
+clone()
        }
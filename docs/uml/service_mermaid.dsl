
classDiagram


class CalibrationService~T~{
            #node
            +calibrate()*
#start()
#stop()
#suspend()
        }
DataObjectService~T~<|--CalibrationService~T~
class DataFrameService~T~{
            
            +insertFrame()
+findBefore()
+findAfter()
+findByDataObject()
-_findTimestamp()
        }
DataService~I,T~<|--DataFrameService~T~
class DataObjectService~T~{
            
            +insertObject()
+insert()
+findByDisplayName()
+findByPosition()
+findByParentUID()
+findBefore()
+findAfter()
-_findTimestamp()
        }
DataService~I,T~<|--DataObjectService~T~
class DataService~I,T~{
            #driver
+priority
            -_buildDriver()
-_destroyDriver()
+setPriority()
+findByUID()
+findOne()
+findAll()
+insert()
+count()
+delete()
+deleteAll()
        }
Service<|--DataService~I,T~
class DataServiceDriver~I,T~{
            +dataType
#options
            +findByUID()*
+findOne()*
+findAll()*
+count()*
+insert()*
+delete()*
+deleteAll()*
        }
class DataServiceOptions~T~ {
            <<interface>>
            +serialize
+deserialize
+keepChangelog
            
        }
Service<|--DataServiceDriver~I,T~
ServiceOptions<|..DataServiceOptions~T~
class QuerySelector~T~ {
            <<interface>>
            +$eq
+$gt
+$gte
+$lt
+$lte
+$in
+$nin
+$elemMatch
            
        }
class RootQuerySelector~T~ {
            <<interface>>
            +$and
+$or
            
        }
class FindOptions {
            <<interface>>
            +dataType
+limit
+sort
            
        }
class MemoryDataService~I,T~{
            #_data
            +findByUID()
+findOne()
+findAll()
+insert()
+delete()
+count()
+deleteAll()
        }
DataServiceDriver~I,T~<|--MemoryDataService~I,T~
class MemoryQueryEvaluator{
            
            -isRegexQuery()$
+evaluateComponent()$
+evaluate()$
+getValueFromPath()$
#evaluatePath()$
#evaluateSelector()$
#evaluateComparisonSelector()$
#evaluateArraySelector()$
#evaluateOp()$
        }
class Service{
            +uid
-_ready
+model
+dependencies
            +addDependency()
#generateUUID()
+setUID()
+isReady()
+emit()
+once()
+logger()
        }
class ServiceOptions {
            <<interface>>
            +uid
            
        }
AsyncEventEmitter<|--Service
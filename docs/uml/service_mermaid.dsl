
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
class RemoteService{
            #nodes
#localServices
#remoteServices
#promises
+model
            -_registerServices()
#registerPromise()
#getPromise()
+localPush()
+localPull()
+localEvent()
+localServiceCall()
+remotePush()*
+remotePull()*
+remoteEvent()*
+remoteServiceCall()*
+registerNode()
+registerService()
        }
class RemoteServiceProxy~T,S~{
            #options
#service
            +get()
+set()
+createHandler()
        }
class RemoteServiceOptions {
            <<interface>>
            +uid
+service
            
        }
class RemotePullOptions {
            <<interface>>
            +clientId
            
        }
class RemotePushOptions {
            <<interface>>
            +clientId
+broadcast
            
        }
Service<|--RemoteService
Service<|--RemoteServiceProxy~T,S~
ProxyHandler~T~<|..RemoteServiceProxy~T,S~
PullOptions<|..RemotePullOptions
PushOptions<|..RemotePushOptions
RemoteServiceProxy~T,S~  --  RemoteServiceOptions
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
class TrajectoryService~T~{
            +model
#options
            -_bindService()
+findCurrentTrajectory()
+findTrajectoryByRange()
+findTrajectories()
+appendPosition()
        }
class TrajectoryServiceOptions {
            <<interface>>
            +dataService
+autoBind
+defaultUID
            
        }
DataService~I,T~<|--TrajectoryService~T~
DataServiceOptions~T~<|..TrajectoryServiceOptions
TrajectoryService~T~  --  TrajectoryServiceOptions
class WorkerServiceProxy{
            #options
-_promises
            -_onOutput()
+get()
+createHandler()
        }
class WorkerServiceCall {
            <<interface>>
            +id
+serviceUID
+method
+parameters
            
        }
class WorkerServiceResponse {
            <<interface>>
            +id
+success
+result
            
        }
ServiceProxy~S~<|--WorkerServiceProxy
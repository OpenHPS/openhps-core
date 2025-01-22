
classDiagram


class CallbackNode~InOut~{
            +pushCallback
+pullCallback
#options
            -_onPush()
-_onPull()
        }
class CallbackNodeOptions {
            <<interface>>
            +autoPush
            
        }
Node~In,Out~<|--CallbackNode~InOut~
NodeOptions<|..CallbackNodeOptions
CallbackNode~InOut~  --  CallbackNodeOptions
class GraphShapeNode~In,Out~{
            -_builder
-_graph
            -_onBuild()
-_onDestroy()
+construct()*
+pull()
+push()
        }
Node~In,Out~<|--GraphShapeNode~In,Out~
class ObjectProcessingNode~InOut~{
            #options
            +process()
+processObject()*
#findObjectByUID()
        }
class ObjectProcessingNodeOptions {
            <<interface>>
            +objectFilter
            
        }
ProcessingNode~In,Out~<|--ObjectProcessingNode~InOut~
ProcessingNodeOptions<|..ObjectProcessingNodeOptions
ObjectProcessingNode~InOut~  --  ObjectProcessingNodeOptions
class ProcessingNode~In,Out~{
            #options
            -_onPush()
#findNodeDataService()
#getNodeData()
#setNodeData()
+processBulk()
+process()*
        }
class ProcessingNodeOptions {
            <<interface>>
            +frameFilter
            
        }
Node~In,Out~<|--ProcessingNode~In,Out~
NodeOptions<|..ProcessingNodeOptions
ProcessingNode~In,Out~  --  ProcessingNodeOptions
class RemoteNode~In,Out,S~{
            #service
#options
+proxyNode
            -_onBuild()
-_onPush()
-_onPull()
-_onLocalPush()
-_onLocalPull()
-_onLocalEvent()
-_onDownstreamCompleted()
-_onDownstreamError()
        }
class RemoteNodeOptions~S~ {
            <<interface>>
            +service
+serialize
+deserialize
            
        }
Node~In,Out~<|--RemoteNode~In,Out,S~
NodeOptions<|..RemoteNodeOptions~S~
class SinkNode~In~{
            #options
            +push()
#persistDataObject()
+onPush()*
        }
class SinkNodeOptions {
            <<interface>>
            +persistence
+completedEvent
            
        }
Node~In,Out~<|--SinkNode~In~
NodeOptions<|..SinkNodeOptions
SinkNode~In~  --  SinkNodeOptions
class SourceNode~Out~{
            #options
            #registerService()
-_onPush()
#mergeFrame()
#mergeObject()
-_onPull()
-_onSequentialPull()
-_onParallelPull()
+onPull()*
        }
class SourceNodeOptions {
            <<interface>>
            +persistence
+source
            
        }
class ActiveSourceOptions {
            <<interface>>
            +interval
+autoStart
+softStop
            
        }
class SensorSourceOptions {
            <<interface>>
            +sensors
            
        }
Node~In,Out~<|--SourceNode~Out~
NodeOptions<|..SourceNodeOptions
SourceNodeOptions<|..ActiveSourceOptions
ActiveSourceOptions<|..SensorSourceOptions
SourceNode~Out~  --  SourceNodeOptions
class WorkerNode~In,Out~{
            #options
#config
#handler
            -_onBuild()
-_onDestroy()
-_onPull()
-_onPush()
-_onWorkerEvent()
-_onWorkerPull()
-_onWorkerPush()
+invokeMethod()
        }
class WorkerNodeOptions {
            <<interface>>
            +optimizedPull
            
        }
Node~In,Out~<|--WorkerNode~In,Out~
NodeOptions<|..WorkerNodeOptions
WorkerOptions<|..WorkerNodeOptions
WorkerNode~In,Out~  --  WorkerNodeOptions
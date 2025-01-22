<h1 align="center">
  <img alt="OpenHPS" src="https://openhps.org/images/logo_text-512.png" width="40%" /><br />
  @openhps/core
</h1>
<p align="center">
    <a href="https://github.com/OpenHPS/openhps-core/actions/workflows/main.yml" target="_blank">
        <img alt="Build Status" src="https://github.com/OpenHPS/openhps-core/actions/workflows/main.yml/badge.svg">
    </a>
    <a href="https://badge.fury.io/js/@openhps%2Fcore">
        <img src="https://badge.fury.io/js/@openhps%2Fcore.svg" alt="npm version" height="18">
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
        <img src="https://img.shields.io/badge/TypeScript-4.0+-blue.svg" alt="TypeScript">
    </a>
    <a href="https://opensource.org/licenses/Apache-2.0" target="_blank">
        <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache 2.0">
    </a>
    <a href="mailto:info@openhps.org" target="_blank">
        <img src="https://img.shields.io/badge/Email-info@openhps.org-blue.svg" alt="Email: info@openhps.org">
    </a>
</p>

<h3 align="center">
    <a href="https://openhps.org/docs/getting-started">Getting Started</a> &mdash; <a href="https://openhps.org/docs/examples">Examples</a> &mdash; <a href="https://openhps.org/docs/core">API</a>
</h3>

<br />

This repository contains the core component for OpenHPS (Open Source Hybrid Positioning System). It includes concepts for creating the model, nodes and data object definitions.

OpenHPS is a data processing positioning framework. It is designed to support many different use cases ranging from simple positioning such as detecting the position of a pawn on a chessboard using RFID, to indoor positioning methods using multiple cameras.

## Features
- 2D, 3D and Geographical positioning.
- Relative positioning.
- Basic positioning algorithms (e.g. trilateration, triangulation, fingerprinting, dead reckoning...)
- Advanced positioning algorithms (e.g. computer vision through @openhps/opencv)
- Extremely extensible.
- Open source.

## Add-ons
### Positioning Algorithms
- **[@openhps/imu](https://github.com/OpenHPS/openhps-imu)** - Adds IMU processing nodes for fusing IMU sensors.
- **[@openhps/rf](https://github.com/OpenHPS/openhps-rf)** - Adds RF processing nodes and data objects.
- **[@openhps/fingerprinting](https://github.com/OpenHPS/openhps-fingerprinting)** - Adds various fingerprinting nodes and services for offline and offline positioning models.
- **[@openhps/video](https://github.com/OpenHPS/openhps-video)** - Provides general data objects and data frames for working with images, video data or cameras.
- **[@openhps/opencv](https://github.com/OpenHPS/openhps-opencv)** - Provides linkage with opencv4nodejs and OpenCV.js for computer vision algorithms on the server or browser.
- **[@openhps/openvslam](https://github.com/OpenHPS/openhps-openvslam)** - Provides bindings to OpenVSLAM
- **[@openhps/orb-slam3](https://github.com/OpenHPS/openhps-orb-slam3)** - Provides bindings to ORB-SLAM3

### Abstractions
- **[@openhps/geospatial](https://github.com/OpenHPS/openhps-geospatial)** - Enables the concept of geospatial spaces (e.g. building, room) on top of reference spaces.

### Data Services
- **[@openhps/mongodb](https://github.com/OpenHPS/openhps-mongodb)** - Adds MongoDB support for the storage of data objects.
- **[@openhps/localstorage](https://github.com/OpenHPS/openhps-localstorage)** - Basic persistent storage for browser based models.
- **[@openhps/rdf](https://github.com/OpenHPS/openhps-rdf)** - RDF exporting of data objects and data frames.
- **[@openhps/solid](https://github.com/OpenHPS/openhps-solid)** - Solid Pods as data storage for data objects.

### Communication
- **[@openhps/socket](https://github.com/OpenHPS/openhps-socket)** - Provides node communication through Socket.IO for remote models.
- **[@openhps/rest](https://github.com/OpenHPS/openhps-rest)** - Provides node communication through restful endpoints.
- **[@openhps/mqtt](https://github.com/OpenHPS/openhps-mqtt)** - MQTT client node communication and standalone MQTT server.

### Smartphone
- **[@openhps/react-native](https://github.com/OpenHPS/openhps-react-native)** - Provides nodes for retrieving sensor data in react-native.
- **[@openhps/nativescript](https://github.com/OpenHPS/openhps-nativescript)** - Provides nodes for retrieving sensor data in NativeScript.
- **[@openhps/cordova](https://github.com/OpenHPS/openhps-cordova)** - Provides nodes for retrieving sensor data in Cordova/Phonegap.
- **[@openhps/capacitor](https://github.com/OpenHPS/openhps-capacitor)** - Provides nodes for retrieving sensor data in Ionic Capacitor.

### Misc
- **[@openhps/sphero](https://github.com/OpenHPS/openhps-sphero)** - Example implementation for controlling and receiving sensor data from Sphero toys.
- **[@openhps/csv](https://github.com/OpenHPS/openhps-csv)** - Read and write data frames from/to CSV files.

## Getting Started
If you have [npm installed](https://www.npmjs.com/get-npm), start using @openhps/core with the following command.
```bash
npm install @openhps/core --save
```

The core idea and goals of OpenHPS are outlined in the technical paper: *OpenHPS: An Open Source Hybrid Positioning System*.

## Usage
```typescript
import { ModelBuilder } from '@openhps/core';

ModelBuilder.create()
    .build().then(model => {
         // ...
    });
```

### Browser
- `openhps-core.js`: UMD
- `openhps-core.es.js`: ES6 import
- `worker.openhps-core.js`: UMD worker
- `openhps-core-lite.js`: UMD lite version for embedded systems

## UML
```mermaid

classDiagram


class Model~In,Out~ {
            <<interface>>
            +referenceSpace: TransformationSpace
            +findService() S
+findService() S
+findDataService() F
+findDataService() F
+findDataService() F
+findAllServices() S[]
+findAllDataServices() S[]
+destroy() Promise~boolean~
        }
Graph~In,Out~<|..Model~In,Out~
class ModelBuilder~In,Out~{
            +graph: ModelGraph~any, any~
            +create() ModelBuilder~In, Out~$
+withLogger() this
+withReferenceSpace() this
+addService() this
+addServices() this
+addShape() this
+build() Promise~Model~In, Out~~
        }
GraphBuilder~In,Out~<|--ModelBuilder~In,Out~
class ModelSerializer{
            +NODES: Map~string, ClassDeclaration~Node~any, any~~~$
+SERVICES: Map~string, ClassDeclaration~Service~~$
-_modules: Set~unknown~$
            +serialize() any$
+serializeNode() any$
+deserialize() Model~In, Out~$
+deserializeNode() Node~In, Out~$
#loadClasses() void$
#initialize() void$
        }
class SerializedModel {
            <<interface>>
            +dependencies?: SerializedDependency[]
            
        }
class SerializedDependency {
            <<interface>>
            
            
        }
class ClassDeclaration~T~ {
            <<interface>>
            +constructor: Serializable~T~
            
        }
class ModelSerializerConfig~T~ {
            <<interface>>
            +serialize?: (obj: T) =~ any
+deserialize?: (obj: any) =~ T
            
        }
class Node~In,Out~{
            #options: NodeOptions
            +setOptions() this
+getOptions() NodeOptions
        }
class NodeOptions {
            <<interface>>
            +uid?: string
+name?: string
            
        }
GraphNode~In,Out~<|--Node~In,Out~
class AsyncEventEmitter{
            
            +emitAsync() Promise~boolean~
        }
EventEmitter~T~<|--AsyncEventEmitter
class DataFrame{
            +uid: string
+createdTimestamp: number
+phenomenonTimestamp?: number
-_source: string
-_objects: Map~string, DataObject~
            +getSensor() T
+getObjects() T[]
+getObjectByUID() T
+hasObject() boolean
+addObject() this
+addSensor() this
+addReferenceSpace() void
+removeObject() void
+clearObjects() void
+clone() this
        }
class DataSerializer{
            #knownTypes: Map~string, Serializable~any~~$
#serializer: Serializer$
#deserializer: Deserializer$
#eventEmitter: EventEmitter~DefaultEventMap~$
            +registerType() void$
+getMetadata() ObjectMetadata$
+getRootMetadata() ObjectMetadata$
+findRootMetaInfo() ObjectMetadata$
+unregisterType() void$
+findTypeByName() Serializable~any~$
+clone() D$
+serialize() any$
+deserialize() T | T[]$
        }
class MappedTypeConverters~T~ {
            <<interface>>
            +deserializer?: (json: any, params: CustomDeserializerParams) =~ T
+serializer?: (value: T, params: CustomSerializerParams) =~ any
+members?: Partial~Record~keyof T, SerializableMemberOptions | IndexedObject~~
            
        }
class DataSerializerConfig {
            <<interface>>
            +serializer?: Serializer
+deserializer?: Deserializer
            
        }
class DataSerializerUtils{
            
            +getOwnMetadata() ObjectMetadata$
+getMetadata() ObjectMetadata$
+createMetadata() ObjectMetadata$
+getRootMetadata() ObjectMetadata$
+ensureTypeDescriptor() TypeDescriptor$
+getMemberOptions() SerializableMemberOptions$
+getIdentifierMemberOptions() SerializableMemberOptions$
+mergeMemberOptions() any$
+updateMemberOptions() void$
+updateObjectMetadata() ObjectMetadata$
        }
class TypeDescriptor{
            +ctor: Serializable~any~
            +getTypes() Serializable~any~[]
+hasFriendlyName() boolean
        }
class ConcreteTypeDescriptor{
            
            
        }
TypeDescriptor<|--ConcreteTypeDescriptor
class Deserializer{
            #options?: OptionsBase
#deserializationStrategy: Map~Serializable~any~, DeserializerFn~any, TypeDescriptor, any~~
#errorHandler: (error: Error) =~ void
#nameResolver?: (ctor: Serializable~any~) =~ string
+setDeserializationStrategy: (type: Serializable~any~, deserializer: DeserializerFn~any, TypeDescriptor, any~) =~ void
+setNameResolver: (nameResolverCallback: (ctor: Serializable~any~) =~ string) =~ void
+setTypeResolver: (typeResolverCallback: TypeResolver) =~ void
+getTypeResolver: () =~ TypeResolver
+setErrorHandler: (errorHandlerCallback: (error: Error) =~ void) =~ void
+getErrorHandler: () =~ (error: Error) =~ void
+instantiateType: (ctor: any) =~ any
+mergeKnownTypes: (...knownTypeMaps: Map~string, Serializable~any~~[]) =~ Map~string, Serializable~any~~
+createKnownTypesMap: (knowTypes: Set~Serializable~any~~) =~ Map~string, Serializable~any~~
+retrievePreserveNull: (memberOptions?: ObjectMemberMetadata) =~ boolean
            #typeResolver() Function
#identityDeserializer() T
+convertSingleValue() any
-_convertSingleValue() any
+convertAsObject() IndexedObject | T
+convertAsArray() any[]
+convertAsSet() Set~any~
+convertAsMap() Map~any, any~
#isExpectedMapShape() boolean
#makeTypeErrorMessage() string
        }
class Serializer{
            #options?: OptionsBase
#typeHintEmitter: TypeHintEmitter
#serializationStrategy: Map~Serializable~any~, SerializerFn~any, TypeDescriptor, any~~
#errorHandler: (error: Error) =~ void
+setSerializationStrategy: (type: Serializable~any~, serializer: SerializerFn~any, TypeDescriptor, any~) =~ void
+setTypeHintEmitter: (typeEmitterCallback: TypeHintEmitter) =~ void
+getTypeHintEmitter: () =~ TypeHintEmitter
+setErrorHandler: (errorHandlerCallback: (error: Error) =~ void) =~ void
+getErrorHandler: () =~ (error: Error) =~ void
+retrievePreserveNull: (memberOptions?: MemberOptionsBase) =~ boolean
            +convertSingleValue() any
-_convertSingleValue() any
+convertAsObject() IndexedObject
+convertAsArray() any[]
+convertAsSet() any[]
+convertAsMap() IndexedObject | #123; key: any; value: any; #125;[]
        }
class UUID{
            -_raw: Uint8Array
            +generate() UUID$
+fromBuffer() UUID$
+fromString() UUID$
+toBuffer() Uint8Array
+to128bit() UUID
+toString() string
        }
class Edge~InOut~{
            +inputNode: GraphNode~any, InOut~
+outputNode: GraphNode~InOut, any~
            -_onPush() Promise~void~
-_onPull() Promise~void~
+push() Promise~void~
+pull() Promise~void~
+emit() boolean
+on() this
        }
EventEmitter~T~<|--Edge~InOut~
Inlet~In~<|..Edge~InOut~
Outlet~Out~<|..Edge~InOut~
class Graph~In,Out~ {
            <<interface>>
            +internalSink: GraphNode~any, any~
+internalSource: GraphNode~any, any~
+edges: Edge~any~[]
+nodes: GraphNode~any, any~[]
            +findNodeByUID() GraphNode~any, any~
+findNodeByName() GraphNode~any, any~
+findEdge() Edge~any~
+addNode() void
+addEdge() void
+deleteEdge() void
+deleteNode() void
        }
GraphNode~In,Out~<|..Graph~In,Out~
class Inlet~In~ {
            <<interface>>
            
            +pull() Promise~void~
+emit() boolean
+emit() boolean
+emit() boolean
+on() this
        }
class Outlet~Out~ {
            <<interface>>
            
            +push() Promise~void~
+on() this
        }
class CallbackNode~InOut~{
            +pushCallback: (frame: InOut | InOut[], options?: PushOptions) =~ void | Promise~void~
+pullCallback: (options?: PullOptions) =~ InOut | InOut[] | Promise~InOut | InOut[]~
#options: CallbackNodeOptions
            -_onPush() Promise~void~
-_onPull() Promise~void~
        }
class CallbackNodeOptions {
            <<interface>>
            +autoPush?: boolean
            
        }
Node~In,Out~<|--CallbackNode~InOut~
NodeOptions<|..CallbackNodeOptions
class GraphShapeNode~In,Out~{
            -_builder: GraphBuilder~In, Out~
-_graph: Graph~In, Out~
            -_onBuild() Promise~void~
-_onDestroy() Promise~boolean~
+construct() GraphBuilder~In, Out~*
+pull() Promise~void~
+push() Promise~void~
        }
Node~In,Out~<|--GraphShapeNode~In,Out~
class ObjectProcessingNode~InOut~{
            #options: ObjectProcessingNodeOptions
            +process() Promise~InOut~
+processObject() Promise~DataObject~*
#findObjectByUID() Promise~DataObject~
        }
class ObjectProcessingNodeOptions {
            <<interface>>
            +objectFilter?: (object: DataObject, frame?: DataFrame) =~ boolean
            
        }
ProcessingNode~In,Out~<|--ObjectProcessingNode~InOut~
ProcessingNodeOptions<|..ObjectProcessingNodeOptions
class ProcessingNode~In,Out~{
            #options: ProcessingNodeOptions
            -_onPush() Promise~void~
#findNodeDataService() NodeDataService~NodeData~
#getNodeData() Promise~any~
#setNodeData() Promise~NodeData~
+processBulk() Promise~Out[]~
+process() Promise~Out~*
        }
class ProcessingNodeOptions {
            <<interface>>
            +frameFilter?: (frame: DataFrame) =~ boolean
            
        }
Node~In,Out~<|--ProcessingNode~In,Out~
NodeOptions<|..ProcessingNodeOptions
class RemoteNode~In,Out,S~{
            #service: S
#options: RemoteNodeOptions~S~
+proxyNode: Node~any, any~
            -_onBuild() Promise~void~
-_onPush() Promise~void~
-_onPull() Promise~void~
-_onLocalPush() Promise~void~
-_onLocalPull() Promise~void~
-_onLocalEvent() void
-_onDownstreamCompleted() void
-_onDownstreamError() void
        }
class RemoteNodeOptions~S~ {
            <<interface>>
            +service?: Serializable~S~
+serialize?: (obj: DataFrame, options?: RemotePushOptions) =~ any
+deserialize?: (obj: any, options?: RemotePushOptions) =~ DataFrame
            
        }
Node~In,Out~<|--RemoteNode~In,Out,S~
NodeOptions<|..RemoteNodeOptions~S~
class SinkNode~In~{
            #options: SinkNodeOptions
            +push() Promise~void~
#persistDataObject() Promise~void~
+onPush() Promise~void~*
        }
class SinkNodeOptions {
            <<interface>>
            +persistence?: boolean
+completedEvent?: boolean
            
        }
Node~In,Out~<|--SinkNode~In~
NodeOptions<|..SinkNodeOptions
class SourceNode~Out~{
            #options: SourceNodeOptions
            #registerService() Promise~void~
-_onPush() Promise~void~
#mergeFrame() Promise~DataFrame~
#mergeObject() DataObject
-_onPull() Promise~void~
-_onSequentialPull() Promise~void~
-_onParallelPull() Promise~void~
+onPull() Promise~Out~*
        }
class SourceNodeOptions {
            <<interface>>
            +persistence?: boolean
+source?: DataObject
            
        }
class ActiveSourceOptions {
            <<interface>>
            +interval?: number
+autoStart?: boolean
+softStop?: boolean
            
        }
class SensorSourceOptions {
            <<interface>>
            +sensors?: SensorType[]
            
        }
Node~In,Out~<|--SourceNode~Out~
NodeOptions<|..SourceNodeOptions
SourceNodeOptions<|..ActiveSourceOptions
ActiveSourceOptions<|..SensorSourceOptions
class WorkerNode~In,Out~{
            #options: WorkerNodeOptions
#config: any
#handler: WorkerHandler
            -_onBuild() Promise~void~
-_onDestroy() Promise~void~
-_onPull() Promise~void~
-_onPush() Promise~void~
-_onWorkerEvent() void
-_onWorkerPull() void
-_onWorkerPush() void
+invokeMethod() Promise~void | Serializable~T~ | Serializable~T~[]~
        }
class WorkerNodeOptions {
            <<interface>>
            +optimizedPull?: boolean
            
        }
Node~In,Out~<|--WorkerNode~In,Out~
NodeOptions<|..WorkerNodeOptions
WorkerOptions<|..WorkerNodeOptions
class CalibrationService~T~{
            #node: CalibrationNode~DataObject~
            +calibrate() Promise~any~*
#start() void
#stop() void
#suspend() void
        }
DataObjectService~T~<|--CalibrationService~T~
class DataFrameService~T~{
            
            +insertFrame() Promise~T~
+findBefore() Promise~T[]~
+findAfter() Promise~T[]~
+findByDataObject() Promise~T[]~
-_findTimestamp() Promise~T[]~
        }
DataService~I,T~<|--DataFrameService~T~
class DataObjectService~T~{
            
            +insertObject() Promise~T~
+insert() Promise~T~
+findByDisplayName() Promise~T[]~
+findByPosition() Promise~T[]~
+findByParentUID() Promise~T[]~
+findBefore() Promise~T[]~
+findAfter() Promise~T[]~
-_findTimestamp() Promise~T[]~
        }
DataService~I,T~<|--DataObjectService~T~
class DataService~I,T~{
            #driver: DataServiceDriver~I, T~
+priority: number
            -_buildDriver() Promise~void~
-_destroyDriver() Promise~void~
+setPriority() this
+findByUID() Promise~T | (T & SerializableChangelog)~
+findOne() Promise~T | (T & SerializableChangelog)~
+findAll() Promise~(T | (T & SerializableChangelog))[]~
+insert() Promise~T | (T & SerializableChangelog)~
+count() Promise~number~
+delete() Promise~void~
+deleteAll() Promise~void~
        }
Service<|--DataService~I,T~
class DataServiceDriver~I,T~{
            +dataType: Constructor~T~
#options: DataServiceOptions~T~
            +findByUID() Promise~T | (T & SerializableChangelog)~*
+findOne() Promise~T | (T & SerializableChangelog)~*
+findAll() Promise~(T | (T & SerializableChangelog))[]~*
+count() Promise~number~*
+insert() Promise~T | (T & SerializableChangelog)~*
+delete() Promise~void~*
+deleteAll() Promise~void~*
        }
class DataServiceOptions~T~ {
            <<interface>>
            +serialize?: (obj: T) =~ any
+deserialize?: (obj: any) =~ T
+keepChangelog?: boolean
            
        }
Service<|--DataServiceDriver~I,T~
ServiceOptions<|..DataServiceOptions~T~
class DummyDataService~I,T~{
            -_dataType: Serializable~T~
            
        }
DataService~I,T~<|--DummyDataService~I,T~
class DummyService{
            
            
        }
Service<|--DummyService
class QuerySelector~T~ {
            <<interface>>
            +$eq?: T
+$gt?: T
+$gte?: T
+$lt?: T
+$lte?: T
+$in?: T[]
+$nin?: T[]
+$elemMatch?: T extends any[] ? any : never
            
        }
class RootQuerySelector~T~ {
            <<interface>>
            +$and?: FilterQuery~T~[]
+$or?: FilterQuery~T~[]
            
        }
class FindOptions {
            <<interface>>
            +dataType?: Serializable~any~
+limit?: number
+sort?: Sort
            
        }
class KeyValueDataService{
            
            +getValue() Promise~any~
+setValue() Promise~void~
        }
DataService~I,T~<|--KeyValueDataService
class LocationBasedService~T,P~{
            #options: LBSOptions
+model: Model~DataFrame, DataFrame~
#service: DataObjectService~T~
#watchers: Map~number, Watcher~
#watchedObjects: Map~string, number[]~
#watchIndex: number
            -_initLBS() void
-_destroy() void
+setCurrentPosition() Promise~void~
+getCurrentPosition() Promise~P~
+watchPosition() number
#watchObject() void
#unwatchObject() void
+clearWatch() void
        }
class Watcher {
            <<interface>>
            +timer: number
+uid: string
+callback: (pos: AbsolutePosition, err?: Error) =~ void
            
        }
class GeoOptions {
            <<interface>>
            +timeout?: number
+maximumAge?: number
+forceUpdate?: boolean
            
        }
class GeoWatchOptions {
            <<interface>>
            +interval?: number
            
        }
class LBSOptions {
            <<interface>>
            +pullNode?: string
+dataService?: Constructor~DataObject~
            
        }
Service<|--LocationBasedService~T,P~
GeoOptions<|..GeoWatchOptions
class MemoryDataService~I,T~{
            #_data: Map~I, any~
            +findByUID() Promise~T~
+findOne() Promise~T~
+findAll() Promise~T[]~
+insert() Promise~T~
+delete() Promise~void~
+count() Promise~number~
+deleteAll() Promise~void~
        }
DataServiceDriver~I,T~<|--MemoryDataService~I,T~
class MemoryQueryEvaluator{
            
            -isRegexQuery() boolean$
+evaluateComponent() boolean$
+evaluate() boolean$
+getValueFromPath() [any, any, string]$
#evaluatePath() boolean$
#evaluateSelector() boolean$
#evaluateComparisonSelector() boolean$
#evaluateArraySelector() boolean$
#evaluateOp() boolean$
        }
class NodeDataService~T~{
            
            +findData() Promise~any~
+insertData() Promise~T~
#getUID() string
        }
class NodeData{
            +uid: string
+data: any
            
        }
DataService~I,T~<|--NodeDataService~T~
class RemoteService{
            #nodes: Set~string~
#localServices: Set~string~
#remoteServices: Set~string~
#promises: Map~string, #123; resolve: (data?: any) =~ void; reject: (ex?: any) =~ void; #125;~
+model: Model~DataFrame, DataFrame~
            -_registerServices() Promise~void~
#registerPromise() string
#getPromise() #123; resolve: (data?: any) =~ void; reject: (ex?: any) =~ void; #125;
+localPush() void
+localPull() void
+localEvent() void
+localServiceCall() any
+remotePush() Promise~void~*
+remotePull() Promise~void~*
+remoteEvent() Promise~void~*
+remoteServiceCall() Promise~any~*
+registerNode() Promise~void~
+registerService() Promise~void~
        }
class RemoteServiceProxy~T,S~{
            #options: RemoteServiceOptions
#service: S
            +get() any
+set() boolean
+createHandler() (...args: any[]) =~ any
        }
class RemoteServiceOptions {
            <<interface>>
            +uid: string
+service?: Constructor~RemoteService~
            
        }
class RemotePullOptions {
            <<interface>>
            +clientId?: string
            
        }
class RemotePushOptions {
            <<interface>>
            +clientId?: string
+broadcast?: boolean
            
        }
Service<|--RemoteService
Service<|--RemoteServiceProxy~T,S~
ProxyHandler~T~<|..RemoteServiceProxy~T,S~
PullOptions<|..RemotePullOptions
PushOptions<|..RemotePushOptions
class Service{
            +uid: string
-_ready: boolean
+model: any
+dependencies?: (new (...args: any[]) =~ Service)[]
            +addDependency() this
#generateUUID() string
+setUID() this
+isReady() boolean
+emit() boolean
+once() this
+logger() void
        }
class ServiceOptions {
            <<interface>>
            +uid?: string
            
        }
AsyncEventEmitter<|--Service
class TimeService{
            -_timeCallback: () =~ number
-_timeUnit: TimeUnit
-_defaultTimeCallback: () =~ number$
-_defaultUnit: TimeUnit$
            +initialize() void$
+getTime() number
+getUnit() TimeUnit
+now() number$
+getUnit() TimeUnit$
        }
Service<|--TimeService
class TrajectoryService~T~{
            +model: Model~DataFrame, DataFrame~
#options: TrajectoryServiceOptions
            -_bindService() Promise~void~
+findCurrentTrajectory() Promise~T~
+findTrajectoryByRange() Promise~T~
+findTrajectories() Promise~string[]~
+appendPosition() Promise~T~
        }
class TrajectoryServiceOptions {
            <<interface>>
            +dataService?: Constructor~DataObject~
+autoBind?: boolean
+defaultUID?: (object: DataObject) =~ string
            
        }
DataService~I,T~<|--TrajectoryService~T~
DataServiceOptions~T~<|..TrajectoryServiceOptions
class WorkerServiceProxy{
            #options: WorkerProxyOptions
-_promises: Map~string, #123; resolve: (data?: any) =~ void; reject: (ex?: any) =~ void; #125;~
            -_onOutput() void
+get() any
+createHandler() (...args: any[]) =~ any
        }
class WorkerProxyOptions {
            <<interface>>
            +uid: string
+callFunction?: (call: WorkerServiceCall) =~ Promise~WorkerServiceResponse~
+callObservable?: Subject~WorkerServiceCall~
+responseObservable?: Subject~WorkerServiceResponse~
            
        }
class WorkerServiceCall {
            <<interface>>
            +id: string
+serviceUID: string
+method: string
+parameters: any[]
            
        }
class WorkerServiceResponse {
            <<interface>>
            +id: string
+success: boolean
+result?: any
            
        }
ServiceProxy~S~<|--WorkerServiceProxy
class MOUSE {
        <<enumeration>>
        LEFT
MIDDLE
RIGHT
ROTATE
DOLLY
PAN
      }
class TOUCH {
        <<enumeration>>
        ROTATE
PAN
DOLLY_PAN
DOLLY_ROTATE
      }
class WebGLMultipleRenderTargets{
            +isWebGLMultipleRenderTargets: true
            
        }
WebGLRenderTarget~TTexture~<|--WebGLMultipleRenderTargets
class WorkerBase{
            +shape: GraphBuilder~any, any~
+model: Model~any, any~
+pullOutput: Subject~any~
+pushOutput: Subject~any~
+serviceOutputCall: Subject~WorkerServiceCall~
+serviceOutputResponse: Subject~WorkerServiceResponse~
+eventOutput: Subject~#123; name: string; event: any; #125;~
#config: WorkerData
+customMethods: Map~string, (model: Model~any, any~, ...args: any[]) =~ Promise~any~~
            +setShape() void
+init() Promise~void~
+invokeMethod() Promise~any~
+pull() Promise~void~
+push() Promise~void~
-_initModel() void
+findAllServices() Promise~any[]~
+callService() Promise~WorkerServiceResponse~
        }
class SerializedWorkerMethod {
            <<interface>>
            +name: string
+handlerFn: string
            
        }
class WorkerData {
            <<interface>>
            +services?: #123; uid: string; dataType?: string; #125;[]
+builder?: string
+serialized?: any
+shape?: string
+imports?: string[]
+directory?: string
+args?: any
+type?: string
+methods?: SerializedWorkerMethod[]
            
        }
class WorkerHandler{
            -_pool: Pool~Thread~
+config: WorkerData
+options: WorkerOptions
-_serviceOutputResponse: Map~number, (response: WorkerServiceResponse) =~ Promise~void~~
#model: Model~DataFrame, DataFrame~
            +build() Promise~void~
+destroy() Promise~void~
+pull() Promise~void~
+push() Promise~void~
+invokeMethod() Promise~void | Serializable~T~ | Serializable~T~[]~
#createWorker() Worker
-_spawnWorker() Promise~Thread~
-_getServices() any[]
-_addServices() void
-_onWorkerService() void
-_onWorkerEvent() void
-_onWorkerPull() void
-_onWorkerPush() void
        }
AsyncEventEmitter<|--WorkerHandler
class WorkerOptions {
            <<interface>>
            +directory?: string
+poolSize?: number
+poolConcurrency?: number
+worker?: string
+imports?: string[]
+type?: "classic" | "typescript" | "module"
+args?: any
+services?: Service[]
+timeout?: number
+blob?: boolean
+methods?: WorkerMethod[]
            
        }
class WorkerMethod {
            <<interface>>
            +name: string
+handler: (model: Model~any, any~, ...args: any[]) =~ void | Promise~any~
            
        }
class ChangeLog{
            #changes: Change[]
            +reset() void
+addChange() void
+getLatestChanges() Change[]
+getDeletedProperties() string[]
+getAddedProperties() string[]
        }
class SerializableChangelog {
            <<interface>>
            +__computed?: ChangeLog
            
        }
class Change {
            <<interface>>
            +property: string
+oldValue: any
+newValue: any
+date: Date
            
        }
class ObjectMetadata {
            <<interface>>
            +dataMembers: Map~string, ObjectMemberMetadata~
+options?: SerializableObjectOptions~any~
            
        }
class ObjectMemberMetadata {
            <<interface>>
            +options?: MemberOptionsBase
            
        }
JsonObjectMetadata<|..ObjectMetadata
JsonMemberMetadata<|..ObjectMemberMetadata
class CustomDeserializerParams {
            <<interface>>
            +fallback: (sourceObject: any, constructor: Serializable~any~ | TypeDescriptor) =~ any
            
        }
class CustomSerializerParams {
            <<interface>>
            +fallback: (sourceObject: any, constructor: Serializable~any~ | TypeDescriptor) =~ any
            
        }
class MemberOptionsBase {
            <<interface>>
            +deserializer?: (json: any, params: CustomDeserializerParams) =~ any
+serializer?: (value: any, params: CustomSerializerParams) =~ any
            
        }
class SerializableObjectOptions~T~ {
            <<interface>>
            
            
        }
class SerializableMemberOptions {
            <<interface>>
            +unique?: boolean
+primaryKey?: boolean
+index?: string | boolean
+numberType?: NumberType
            
        }
class SerializableArrayMemberOptions {
            <<interface>>
            +numberType?: NumberType
            
        }
class SerializableSetMemberOptions {
            <<interface>>
            +numberType?: NumberType
            
        }
class SerializableMapMemberOptions {
            <<interface>>
            +key?: #123; numberType?: NumberType; #125;
+value?: #123; numberType?: NumberType; #125;
            
        }
class NumberType {
        <<enumeration>>
        INTEGER
FLOAT
DOUBLE
DECIMAL
LONG
SHORT
      }
IJsonMemberOptions<|..MemberOptionsBase
IJsonObjectOptions~T~<|..SerializableObjectOptions~T~
MemberOptionsBase<|..SerializableMemberOptions
MemberOptionsBase<|..SerializableArrayMemberOptions
IJsonArrayMemberOptions<|..SerializableArrayMemberOptions
MemberOptionsBase<|..SerializableSetMemberOptions
IJsonSetMemberOptions<|..SerializableSetMemberOptions
MemberOptionsBase<|..SerializableMapMemberOptions
IJsonMapMemberOptions<|..SerializableMapMemberOptions
class ActuatableProperty{
            +name: string
+callback: (...args: any[]) =~ Promise~any~
            
        }
class ActuatableObject{
            #properties: Map~string, ActuatableProperty~
            +invoke() Promise~any~
        }
DataObject<|--ActuatableObject
class DataObject{
            +displayName: string
+createdTimestamp: number
+uid: string
-_position: AbsolutePosition
-_relativePositions: Map~string, Map~string, RelativePosition~any, Unit~~~
+parentUID: string
            +getPosition() AbsolutePosition
+setPosition() this
+setUID() this
+setParent() this
+removeRelativePositions() void
+addRelativePosition() this
+getRelativePositions() RelativePosition~any, Unit~[]
+getRelativePosition() RelativePosition~any, Unit~
+hasRelativePosition() boolean
+bind() DataObjectBinding~this~
+clone() T
        }
class DataObjectBinding~T~{
            #service: DataService~string, T~
#target: T
            -_onInsert() void
+on() this
+save() Promise~T~
+delete() Promise~void~
+dispose() void
        }
EventEmitter~T~<|--DataObjectBinding~T~
class SensorCalibrationData~T~{
            +unit?: Unit
+offset?: T
+multiplier?: T
            
        }
class SensorObject~T~{
            +value: T
+frequency: number
+calibrationData?: SensorCalibrationData~T~
            
        }
DataObject<|--SensorObject~T~
class Absolute2DPosition{
            #vector: Vector3
            +angleTo() number
+fromVector() this
+toVector3() Vector3
+clone() this
        }
AbsolutePosition<|--Absolute2DPosition
class Absolute3DPosition{
            
            +fromVector() this
+toVector3() Vector3
+clone() this
        }
Absolute2DPosition<|--Absolute3DPosition
class AbsolutePosition{
            +timestamp: number
+velocity: Velocity
+orientation: Orientation
+unit: LengthUnit
+referenceSpaceUID: string
-_accuracy: Accuracy~LengthUnit, any~
-_probability: number
            +setOrientation() this
+setAccuracy() this
+fromVector() this*
+toVector3() Vector3*
+angleTo() number*
+distanceTo() number
+equals() boolean
+clone() this
        }
Position~U~<|..AbsolutePosition
class GeographicalPosition{
            
            +distanceTo() number
+bearing() number
+angleTo() number
+destination() GeographicalPosition
+fromVector() this
+toVector3() Vector3
+clone() this
        }
Absolute3DPosition<|--GeographicalPosition
class Orientation{
            +timestamp: number
+accuracy: Accuracy~AngleUnit, number~
            +fromBearing() Orientation$
+fromQuaternion() Orientation$
+clone() this
        }
Quaternion<|--Orientation
class Pose{
            +timestamp: number
+unit: LengthUnit
-_accuracy: Accuracy~LengthUnit, any~
-_probability: number
            +fromMatrix4() T$
+fromPosition() T$
        }
Matrix4<|--Pose
Position~U~<|..Pose
class Position~U~ {
            <<interface>>
            +timestamp: number
+accuracy: Accuracy~U, any~
+probability: number
            +clone() this
+equals() boolean
        }
class Relative2DPosition{
            
            +fromVector() this
+toVector3() Vector3
+clone() this
        }
RelativePosition~T,U~<|--Relative2DPosition
class Relative3DPosition{
            
            +fromVector() this
+toVector3() Vector3
+clone() this
        }
Relative2DPosition<|--Relative3DPosition
class RelativeAngle{
            +orientation: Orientation
+unit: AngleUnit
+referenceValue: number
            
        }
RelativePosition~T,U~<|--RelativeAngle
class RelativeAngularVelocity{
            +referenceValue: AngularVelocity
            
        }
RelativePosition~T,U~<|--RelativeAngularVelocity
class RelativeDistance{
            +unit: LengthUnit
+referenceValue: number
            
        }
RelativePosition~T,U~<|--RelativeDistance
class RelativeLinearVelocity{
            +referenceValue: LinearVelocity
            
        }
RelativePosition~T,U~<|--RelativeLinearVelocity
class RelativeOrientation{
            
            +fromQuaternion() Orientation$
+clone() this
        }
RelativePosition~T,U~<|--RelativeOrientation
class RelativePosition~T,U~{
            +timestamp: number
+referenceObjectUID: string
+referenceObjectType: string
+referenceValue: T
-_accuracy: Accuracy~U, any~
-_probability: number
-_defaultUnit: U
+unit: U
            +setAccuracy() this
+equals() boolean
+clone() this
        }
Position~U~<|..RelativePosition~T,U~
class Trajectory{
            +uid: string
+objectUID: string
+positions: AbsolutePosition[]
+createdTimestamp: number
            
        }
class Acceleration{
            
            
        }
SensorValue~U~<|--Acceleration
class Accuracy~U,T~{
            +value: T
#_unit: Unit
            +to() this
+valueOf() number*
+toString() string*
+clone() this
        }
class Accuracy1D~U~{
            +value: number
            +valueOf() number
+toString() string
        }
Accuracy~U,T~<|--Accuracy1D~U~
class Accuracy2D~U~{
            +value: Vector3
            +to() this
+valueOf() number
+toString() string
        }
Accuracy~U,T~<|--Accuracy2D~U~
class Accuracy3D~U~{
            
            +to() this
+valueOf() number
        }
Accuracy2D~U~<|--Accuracy3D~U~
class AngularVelocity{
            +unit: AngularVelocityUnit
            +fromArray() T$
        }
SensorValue~U~<|--AngularVelocity
class Humidity{
            
            
        }
SensorValue~U~<|--Humidity
class LinearVelocity{
            +unit: LinearVelocityUnit
            +fromArray() T$
        }
SensorValue~U~<|--LinearVelocity
class Magnetism{
            +unit: MagnetismUnit
            
        }
SensorValue~U~<|--Magnetism
class Pressure{
            
            
        }
SensorValue~U~<|--Pressure
class SensorValue~U~{
            +timestamp: number
+accuracy: Accuracy~U, number | Vector3~
-_defaultUnit?: U
+unit: U
            +setAccuracy() this
+toTuple() Vector3Tuple
+clone() this
        }
Vector3<|--SensorValue~U~
class Temperature{
            
            
        }
SensorValue~U~<|--Temperature
class Velocity{
            +linear: LinearVelocity
+angular: AngularVelocity
            +clone() this
        }
class GraphNode~In,Out~{
            +name: string
+uid: string
+graph: any
-_ready: boolean
-_available: boolean
            +logger() void
+isReady() boolean
+isAvailable() boolean
+emit() boolean
+on() this
+once() this
+pull() Promise~void~
+push() Promise~void~
+onceAvailable() Promise~void~
+onceCompleted() Promise~PushEvent~
-_onError() void
-_onCompleted() void
        }
AsyncEventEmitter<|--GraphNode~In,Out~
Inlet~In~<|..GraphNode~In,Out~
Outlet~Out~<|..GraphNode~In,Out~
class GraphBuilder~In,Out~{
            +graph: GraphShape~In, Out~
            +create() GraphBuilder~In, Out~$
+on() this
+from() GraphShapeBuilder~any~
+addNode() this
+addEdge() this
+deleteEdge() this
+deleteNode() this
+addShape() this
+build() Promise~Graph~In, Out~~
        }
class GraphShapeBuilder~Builder~{
            #graphBuilder: Builder
#previousNodes: GraphNode~any, any~[]
#graph: GraphShape~any, any~
#shapes: Map~string, (...args: any[]) =~ GraphNode~any, any~~$
            #viaGraph() GraphNode~any, any~
+via() this
-_insertNode() void
+registerShape() void$
+chunk() this
+flatten() this
+filter() this
+filterObjects() this
+merge() this
+debounce() this
+delay() this
+clone() this
+convertToSpace() this
+convertFromSpace() this
+buffer() this
+store() Builder
+to() Builder
        }
class PushCompletedEvent {
            <<interface>>
            
            
        }
PushEvent<|..PushCompletedEvent
class PushError{
            +frameUID: string
+nodeUID: string
            
        }
class PushEvent {
            <<interface>>
            +frameUID: string
            
        }
class GraphOptions {
            <<interface>>
            
            
        }
class PullOptions {
            <<interface>>
            +count?: number
+requestedObjects?: string[]
+sequentialPull?: boolean
+sourceNode?: string
            
        }
GraphOptions<|..PullOptions
class PushOptions {
            <<interface>>
            +sourceNode?: string
+lastNode?: string
            
        }
GraphOptions<|..PushOptions
class PlaceholderNode~InOut~{
            
            
        }
Node~In,Out~<|--PlaceholderNode~InOut~
class AccuracyModifierNode~InOut~{
            #options: AccuracyModifierOptions
            +processObject() Promise~DataObject~
        }
class AccuracyModifierOptions {
            <<interface>>
            +offset?: number
+offsetUnit?: LengthUnit
+magnitude?: number
+defaultValue?: number
+value?: number
            
        }
ObjectProcessingNode~InOut~<|--AccuracyModifierNode~InOut~
ObjectProcessingNodeOptions<|..AccuracyModifierOptions
class CalibrationNode~T~{
            #state: CalibrationState
#service: CalibrationService~any~
#options: CalibrationOptions
#frameCallback: CalibrationFrameCallback
#objectCallback: CalibrationObjectCallback
            -_onBuild() void
+processObject() Promise~T~
+process() Promise~DataFrame~
+start() void
+suspend() void
+stop() void
        }
class CalibrationOptions {
            <<interface>>
            +service: Constructor~CalibrationService~any~~
            
        }
class CalibrationState {
        <<enumeration>>
        IDLE
SUSPENDED
RUNNING
      }
ObjectProcessingNode~InOut~<|--CalibrationNode~T~
ObjectProcessingNodeOptions<|..CalibrationOptions
class CellIdentificationNode~InOut~{
            #options: CellIdentificationOptions
            +processRelativePositions() Promise~DataObject~
        }
class CellIdentificationOptions {
            <<interface>>
            +maxDistance?: number
            
        }
RelativePositionProcessing~InOut,R~<|--CellIdentificationNode~InOut~
ObjectProcessingNodeOptions<|..CellIdentificationOptions
class MultilaterationNode~InOut~{
            #options: MultilaterationOptions
            +processRelativePositions() Promise~DataObject~
#nls() AbsolutePosition
#midpoint() P
#midpointGeographical() GeographicalPosition
#trilaterate() Promise~P~
-_calculateInit() number[]
-_calculateError() number
        }
class Sphere~P~{
            +position: P
+radius: number
+accuracy: number
            
        }
class MultilaterationOptions {
            <<interface>>
            +maxIterations?: number
+incrementStep?: number
+minReferences?: number
+maxReferences?: number
+nlsFunction?: (spheres: Sphere~any~[]) =~ AbsolutePosition
+preferNls?: boolean
            
        }
RelativePositionProcessing~InOut,R~<|--MultilaterationNode~InOut~
ObjectProcessingNodeOptions<|..MultilaterationOptions
class ReferenceSpaceConversionNode~InOut~{
            -_referenceSpaceUID: string
-_referenceSpace: ReferenceSpace
#options: SpaceConversionOptions
            -_onRegisterService() Promise~void~
+processObject() Promise~DataObject~
        }
class SpaceConversionOptions {
            <<interface>>
            
            
        }
ObjectProcessingNode~InOut~<|--ReferenceSpaceConversionNode~InOut~
ObjectProcessingNodeOptions<|..SpaceConversionOptions
SpaceTransformationOptions<|..SpaceConversionOptions
class RelativePositionProcessing~InOut,R~{
            -_relativePositionType: new () =~ R
            +processObject() Promise~DataObject~
+processRelativePositions() Promise~DataObject~*
        }
ObjectProcessingNode~InOut~<|--RelativePositionProcessing~InOut,R~
class TriangulationNode~InOut~{
            
            +processRelativePositions() Promise~DataObject~
#triangulate() Promise~P~
        }
RelativePositionProcessing~InOut,R~<|--TriangulationNode~InOut~
class BalanceNode~InOut~{
            -_busyNodes: Outlet~any~[]
-_queue: #123; frame: InOut | InOut[]; resolve: () =~ void; reject: (ex?: any) =~ void; #125;[]
            +push() Promise~void~
-_updateQueue() void
        }
Node~In,Out~<|--BalanceNode~InOut~
class BroadcastNode~InOut~{
            
            
        }
Node~In,Out~<|--BroadcastNode~InOut~
class BufferNode~InOut~{
            #service: DataFrameService~InOut~
#options: BufferOptions
            -_initService() Promise~void~
+onPull() Promise~void~
+onPush() Promise~void~
#next() Promise~InOut~
#shift() Promise~InOut~
        }
class BufferOptions {
            <<interface>>
            +service?: string
            
        }
Node~In,Out~<|--BufferNode~InOut~
NodeOptions<|..BufferOptions
class FrameChunkNode~InOut~{
            -_count: number
-_queue: InOut[]
-_interval: number
-_timer: Timeout
            -_onPush() Promise~void~
-_flushQueue() Promise~void~
-_timeoutFn() void
-_start() Promise~void~
-_stop() void
        }
Node~In,Out~<|--FrameChunkNode~InOut~
class FrameCloneNode~InOut~{
            #options: FrameCloneOptions
            -_onPush() Promise~void~
-_repack() InOut
        }
class FrameCloneOptions {
            <<interface>>
            +repack?: boolean
            
        }
Node~In,Out~<|--FrameCloneNode~InOut~
NodeOptions<|..FrameCloneOptions
class FrameDebounceNode~InOut~{
            -_timeout: number
-_timeoutUnit: TimeUnit
-_timer: Timeout
-_accept: boolean
            -_start() Promise~void~
-_stop() void
+process() Promise~InOut~
        }
ProcessingNode~In,Out~<|--FrameDebounceNode~InOut~
class FrameDelayNode~InOut~{
            -_timeout: number
-_timeoutUnit: TimeUnit
            +process() Promise~InOut~
        }
ProcessingNode~In,Out~<|--FrameDelayNode~InOut~
class FrameFilterNode~InOut~{
            #filterFn: (frame: InOut) =~ boolean
            +process() Promise~InOut~
        }
ProcessingNode~In,Out~<|--FrameFilterNode~InOut~
class FrameFlattenNode~InOut~{
            
            -_onPush() Promise~void~
        }
Node~In,Out~<|--FrameFlattenNode~InOut~
class FrameMergeNode~InOut~{
            
            +mergeObjects() DataObject
+mergePositions() AbsolutePosition
-_mergeVelocity() LinearVelocity
-_mergeOrientation() Orientation
+merge() InOut
        }
MergeShape~InOut~<|--FrameMergeNode~InOut~
class MemoryBufferNode~InOut~{
            
            
        }
BufferNode~InOut~<|--MemoryBufferNode~InOut~
class MergeShape~InOut~{
            -_queue: Map~any, QueuedMerge~InOut~~
-_timeout: number
-_timer: Timeout
-_mergeKeyFn: (frame: InOut, options?: PushOptions) =~ any
-_groupFn: (frame: InOut, options?: PushOptions) =~ any
#options: MergeShapeOptions
            -_start() Promise~void~
-_timerTick() void
-_purgeQueue() QueuedMerge~InOut~
-_stop() void
+process() Promise~InOut~
+merge() InOut*
        }
class QueuedMerge~InOut~{
            +key: any
+frames: Map~any, InOut~
+promises: ((value: InOut) =~ void)[]
+timestamp: number
            
        }
class MergeShapeOptions {
            <<interface>>
            +timeout?: number
+timeoutUnit?: TimeUnit
+checkInterval?: number
+minCount?: number
+maxCount?: number
            
        }
ProcessingNode~In,Out~<|--MergeShape~InOut~
ProcessingNodeOptions<|..MergeShapeOptions
class ObjectFilterNode~InOut~{
            #options: ObjectProcessingNodeOptions
            +process() Promise~InOut~
        }
ProcessingNode~In,Out~<|--ObjectFilterNode~InOut~
class ObjectMergeNode~InOut~{
            #options: ObjectMergeOptions
            +merge() InOut
        }
class ObjectMergeOptions {
            <<interface>>
            
            
        }
FrameMergeNode~InOut~<|--ObjectMergeNode~InOut~
MergeShapeOptions<|..ObjectMergeOptions
ObjectProcessingNodeOptions<|..ObjectMergeOptions
class SourceMergeNode~InOut~{
            
            
        }
FrameMergeNode~InOut~<|--SourceMergeNode~InOut~
class ThrottleNode~InOut~{
            -_pushReady: boolean
            +onThrottlePush() Promise~void~
-_handlePush() Promise~void~
        }
MemoryBufferNode~InOut~<|--ThrottleNode~InOut~
class TimedPullNode~InOut~{
            -_interval: number
-_timer: Timeout
-_pushFinished: boolean
-_pullFinished: boolean
#options: TimedPullOptions
            -_onPush() Promise~void~
-_intervalFn() void
+start() Promise~void~
+stop() void
        }
class TimedPullOptions {
            <<interface>>
            +throttlePull?: boolean
+pullOptions?: PullOptions
+autoStart?: boolean
            
        }
Node~In,Out~<|--TimedPullNode~InOut~
NodeOptions<|..TimedPullOptions
class TimeSyncNode~InOut~{
            -_timer: Timer
#options: TimeSyncOptions
            -_initTimer() void
-_stopTimer() void
+onPush() Promise~void~
#triggerUpdate() Promise~void~
#next() Promise~InOut~
        }
class TimeSyncOptions {
            <<interface>>
            +checkInterval?: number
            
        }
MemoryBufferNode~InOut~<|--TimeSyncNode~InOut~
BufferOptions<|..TimeSyncOptions
class UnitConversionNode~InOut~{
            -_unit: LengthUnit
            +processObject() Promise~DataObject~
        }
ObjectProcessingNode~InOut~<|--UnitConversionNode~InOut~
class CallbackSinkNode~In~{
            +callback: (frame: In | In[], options?: PushOptions) =~ void | Promise~void~
            +onPush() Promise~void~
        }
SinkNode~In~<|--CallbackSinkNode~In~
class LoggingSinkNode~In~{
            
            
        }
CallbackSinkNode~In~<|--LoggingSinkNode~In~
class RemoteSinkNode~In,S,N~{
            #remoteNode: N
            -_onRemoteBuild() Promise~boolean~
-_onRemoteDestroy() Promise~boolean~
+onPush() Promise~void~
        }
class RemoteSinkNodeOptions~S~ {
            <<interface>>
            +type?: Constructor~RemoteNode~any, any, S~~
            
        }
SinkNode~In~<|--RemoteSinkNode~In,S,N~
SinkNodeOptions<|..RemoteSinkNodeOptions~S~
RemoteNodeOptions~S~<|..RemoteSinkNodeOptions~S~
class CallbackSourceNode~Out~{
            +callback: (options?: PullOptions) =~ Out | Promise~Out~
            +onPull() Promise~Out~
        }
SourceNode~Out~<|--CallbackSourceNode~Out~
class HistorySourceNode~Out~{
            
            +onPull() Promise~Out~
        }
SourceNode~Out~<|--HistorySourceNode~Out~
class ListSourceNode~Out~{
            -_inputData: Out[]
            +onPull() Promise~Out~
        }
SourceNode~Out~<|--ListSourceNode~Out~
class RemoteSourceNode~Out,S,N~{
            #remoteNode: N
            -_onRemoteBuild() Promise~boolean~
+onPull() Promise~Out~
-_onDownstreamError() void
-_onDownstreamCompleted() void
        }
class RemoteSourceNodeOptions~S~ {
            <<interface>>
            +type?: Constructor~RemoteNode~any, any, S~~
            
        }
SourceNode~Out~<|--RemoteSourceNode~Out,S,N~
SourceNodeOptions<|..RemoteSourceNodeOptions~S~
RemoteNodeOptions~S~<|..RemoteSourceNodeOptions~S~
class DataServiceProxy~I,T,S~{
            
            +get() any
        }
ServiceProxy~S~<|--DataServiceProxy~I,T,S~
class ServiceProxy~S~{
            
            +get() any
+set() boolean
+createHandler() (...args: any[]) =~ any
        }
Service<|--ServiceProxy~S~
ProxyHandler~T~<|..ServiceProxy~S~
class AnimationAction{
            +blendMode: AnimationBlendMode
+loop: AnimationActionLoopStyles
+time: number
+timeScale: number
+weight: number
+repetitions: number
+paused: boolean
+enabled: boolean
+clampWhenFinished: boolean
+zeroSlopeAtStart: boolean
+zeroSlopeAtEnd: boolean
            +play() AnimationAction
+stop() AnimationAction
+reset() AnimationAction
+isRunning() boolean
+isScheduled() boolean
+startAt() AnimationAction
+setLoop() AnimationAction
+setEffectiveWeight() AnimationAction
+getEffectiveWeight() number
+fadeIn() AnimationAction
+fadeOut() AnimationAction
+crossFadeFrom() AnimationAction
+crossFadeTo() AnimationAction
+stopFading() AnimationAction
+setEffectiveTimeScale() AnimationAction
+getEffectiveTimeScale() number
+setDuration() AnimationAction
+syncWith() AnimationAction
+halt() AnimationAction
+warp() AnimationAction
+stopWarping() AnimationAction
+getMixer() AnimationMixer
+getClip() AnimationClip
+getRoot() Object3D~Object3DEventMap~
        }
class AnimationClip{
            +name: string
+tracks: KeyframeTrack[]
+blendMode: AnimationBlendMode
+duration: number
+uuid: string
+results: any[]
            +resetDuration() AnimationClip
+trim() AnimationClip
+validate() boolean
+optimize() AnimationClip
+clone() this
+toJSON() any
+CreateFromMorphTargetSequence() AnimationClip$
+findByName() AnimationClip$
+CreateClipsFromMorphTargetSequences() AnimationClip[]$
+parse() AnimationClip$
+parseAnimation() AnimationClip$
+toJSON() any$
        }
class MorphTarget {
            <<interface>>
            +name: string
+vertices: Vector3[]
            
        }
class AnimationMixer{
            +time: number
+timeScale: number
            +clipAction() AnimationAction
+existingAction() AnimationAction
+stopAllAction() AnimationMixer
+update() AnimationMixer
+setTime() AnimationMixer
+getRoot() Object3D~Object3DEventMap~ | AnimationObjectGroup
+uncacheClip() void
+uncacheRoot() void
+uncacheAction() void
        }
class AnimationMixerEventMap {
            <<interface>>
            +loop: #123; action: AnimationAction; loopDelta: number; #125;
+finished: #123; action: AnimationAction; direction: number; #125;
            
        }
EventDispatcher~TEventMap~<|--AnimationMixer
class AnimationObjectGroup{
            +uuid: string
+stats: #123; bindingsPerObject: number; objects: { total: number; inUse: number; #125;; }
+isAnimationObjectGroup: true
            +add() void
+remove() void
+uncache() void
        }
class KeyframeTrack{
            +name: string
+times: Float32Array
+values: Float32Array
+ValueTypeName: string
+TimeBufferType: Float32Array
+ValueBufferType: Float32Array
+DefaultInterpolation: InterpolationModes
            +InterpolantFactoryMethodDiscrete() DiscreteInterpolant
+InterpolantFactoryMethodLinear() LinearInterpolant
+InterpolantFactoryMethodSmooth() CubicInterpolant
+setInterpolation() KeyframeTrack
+getInterpolation() InterpolationModes
+createInterpolant() Interpolant
+getValueSize() number
+shift() KeyframeTrack
+scale() KeyframeTrack
+trim() KeyframeTrack
+validate() boolean
+optimize() KeyframeTrack
+clone() this
+toJSON() any$
        }
class PropertyBinding{
            +path: string
+parsedPath: any
+node: any
+rootNode: any
+BindingType: #123; [bindingType: string]: number; #125;
+Versioning: #123; [versioning: string]: number; #125;
+GetterByBindingType: (() =~ void)[]
+SetterByBindingTypeAndVersioning: (() =~ void)[][]
            +getValue() any
+setValue() void
+bind() void
+unbind() void
+create() PropertyBinding | Composite$
+sanitizeNodeName() string$
+parseTrackName() ParseTrackNameResults$
+findNode() any$
        }
class ParseTrackNameResults {
            <<interface>>
            +nodeName: string
+objectName: string
+objectIndex: string
+propertyName: string
+propertyIndex: string
            
        }
class PropertyMixer{
            +binding: any
+valueSize: number
+buffer: any
+cumulativeWeight: number
+cumulativeWeightAdditive: number
+useCount: number
+referenceCount: number
            +accumulate() void
+accumulateAdditive() void
+apply() void
+saveOriginalState() void
+restoreOriginalState() void
        }
class Audio~NodeType~{
            +type: string
+listener: AudioListener
+context: AudioContext
+gain: GainNode
+autoplay: boolean
+buffer: AudioBuffer
+detune: number
+loop: boolean
+loopStart: number
+loopEnd: number
+offset: number
+duration: number
+playbackRate: number
+isPlaying: boolean
+hasPlaybackControl: boolean
+sourceType: string
+source: AudioScheduledSourceNode
+filters: AudioNode[]
            +getOutput() NodeType
+setNodeSource() this
+setMediaElementSource() this
+setMediaStreamSource() this
+setBuffer() this
+play() this
+pause() this
+stop() this
+onEnded() void
+connect() this
+disconnect() this
+getDetune() number
+setDetune() this
+getFilter() AudioNode
+setFilter() this
+getFilters() AudioNode[]
+setFilters() this
+getPlaybackRate() number
+setPlaybackRate() this
+getLoop() boolean
+setLoop() this
+setLoopStart() this
+setLoopEnd() this
+getVolume() number
+setVolume() this
        }
Object3D~TEventMap~<|--Audio~NodeType~
class AudioAnalyser{
            +analyser: AnalyserNode
+data: Uint8Array
            +getFrequencyData() Uint8Array
+getAverageFrequency() number
        }
class AudioListener{
            +type: string
+context: AudioContext
+gain: GainNode
+filter: AudioNode
+timeDelta: number
            +getInput() GainNode
+removeFilter() this
+getFilter() AudioNode
+setFilter() this
+getMasterVolume() number
+setMasterVolume() this
        }
Object3D~TEventMap~<|--AudioListener
class PositionalAudio{
            +panner: PannerNode
            +getOutput() PannerNode
+getRefDistance() number
+setRefDistance() this
+getRolloffFactor() number
+setRolloffFactor() this
+getDistanceModel() string
+setDistanceModel() this
+getMaxDistance() number
+setMaxDistance() this
+setDirectionalCone() this
        }
Audio~NodeType~<|--PositionalAudio
class ArrayCamera{
            +isArrayCamera: true
+cameras: PerspectiveCamera[]
            
        }
PerspectiveCamera<|--ArrayCamera
class Camera{
            +isCamera: true
+type: string
+layers: Layers
+matrixWorldInverse: Matrix4
+projectionMatrix: Matrix4
+projectionMatrixInverse: Matrix4
+coordinateSystem: CoordinateSystem
+viewport?: Vector4
            +getWorldDirection() Vector3
        }
Object3D~TEventMap~<|--Camera
class CubeCamera{
            +type: string
+renderTarget: WebGLCubeRenderTarget
+coordinateSystem: CoordinateSystem
+activeMipmapLevel: number
            +updateCoordinateSystem() void
+update() void
        }
Object3D~TEventMap~<|--CubeCamera
class OrthographicCamera{
            +isOrthographicCamera: true
+type: string
+zoom: number
+view: #123; enabled: boolean; fullWidth: number; fullHeight: number; offsetX: number; offsetY: number; width: number; height: number; #125;
+left: number
+right: number
+top: number
+bottom: number
+near: number
+far: number
            +updateProjectionMatrix() void
+setViewOffset() void
+clearViewOffset() void
        }
Camera<|--OrthographicCamera
class PerspectiveCamera{
            +isPerspectiveCamera: true
+type: string
+zoom: number
+fov: number
+aspect: number
+near: number
+far: number
+focus: number
+view: #123; enabled: boolean; fullWidth: number; fullHeight: number; offsetX: number; offsetY: number; width: number; height: number; #125;
+filmGauge: number
+filmOffset: number
            +getFocalLength() number
+setFocalLength() void
+getEffectiveFOV() number
+getFilmWidth() number
+getFilmHeight() number
+getViewBounds() void
+getViewSize() Vector2
+setViewOffset() void
+clearViewOffset() void
+updateProjectionMatrix() void
+setLens() void
        }
Camera<|--PerspectiveCamera
class StereoCamera{
            +type: "StereoCamera"
+aspect: number
+eyeSep: number
+cameraL: PerspectiveCamera
+cameraR: PerspectiveCamera
            +update() void
        }
Camera<|--StereoCamera
class BufferAttribute{
            +name: string
+array: TypedArray
+itemSize: number
+usage: Usage
+gpuType: AttributeGPUType
+updateRange: #123; offset: number; count: number; #125;
+updateRanges: #123; start: number; count: number; #125;[]
+version: number
+normalized: boolean
+count: number
+isBufferAttribute: true
+onUploadCallback: () =~ void
            +onUpload() this
+setUsage() this
+addUpdateRange() void
+clearUpdateRanges() void
+clone() BufferAttribute
+copy() this
+copyAt() this
+copyArray() this
+applyMatrix3() this
+applyMatrix4() this
+applyNormalMatrix() this
+transformDirection() this
+set() this
+getComponent() number
+setComponent() void
+getX() number
+setX() this
+getY() number
+setY() this
+getZ() number
+setZ() this
+getW() number
+setW() this
+setXY() this
+setXYZ() this
+setXYZW() this
+toJSON() #123; itemSize: number; type: string; array: number[]; normalized: boolean; #125;
        }
class Int8BufferAttribute{
            
            
        }
class Uint8BufferAttribute{
            
            
        }
class Uint8ClampedBufferAttribute{
            
            
        }
class Int16BufferAttribute{
            
            
        }
class Uint16BufferAttribute{
            
            
        }
class Int32BufferAttribute{
            
            
        }
class Uint32BufferAttribute{
            
            
        }
class Float16BufferAttribute{
            
            
        }
class Float32BufferAttribute{
            
            
        }
BufferAttribute<|--Int8BufferAttribute
BufferAttribute<|--Uint8BufferAttribute
BufferAttribute<|--Uint8ClampedBufferAttribute
BufferAttribute<|--Int16BufferAttribute
BufferAttribute<|--Uint16BufferAttribute
BufferAttribute<|--Int32BufferAttribute
BufferAttribute<|--Uint32BufferAttribute
BufferAttribute<|--Float16BufferAttribute
BufferAttribute<|--Float32BufferAttribute
class BufferGeometry~Attributes~{
            +id: number
+uuid: string
+name: string
+type: string
+index: BufferAttribute
+attributes: Attributes
+morphAttributes: #123; [name: string]: (BufferAttribute | InterleavedBufferAttribute)[]; #125;
+morphTargetsRelative: boolean
+groups: #123; start: number; count: number; materialIndex?: number; #125;[]
+boundingBox: Box3
+boundingSphere: Sphere
+drawRange: #123; start: number; count: number; #125;
+userData: Record~string, any~
+isBufferGeometry: true
            +getIndex() BufferAttribute
+setIndex() this
+setAttribute() this
+getAttribute() Attributes[K]
+deleteAttribute() this
+hasAttribute() boolean
+addGroup() void
+clearGroups() void
+setDrawRange() void
+applyMatrix4() this
+applyQuaternion() this
+rotateX() this
+rotateY() this
+rotateZ() this
+translate() this
+scale() this
+lookAt() this
+center() this
+setFromPoints() this
+computeBoundingBox() void
+computeBoundingSphere() void
+computeTangents() void
+computeVertexNormals() void
+normalizeNormals() void
+toNonIndexed() BufferGeometry~NormalBufferAttributes~
+toJSON() #123;#125;
+clone() this
+copy() this
+dispose() void
        }
EventDispatcher~TEventMap~<|--BufferGeometry~Attributes~
class Clock{
            +autoStart: boolean
+startTime: number
+oldTime: number
+elapsedTime: number
+running: boolean
            +start() void
+stop() void
+getElapsedTime() number
+getDelta() number
        }
class EventDispatcher~TEventMap~{
            
            +addEventListener() void
+addEventListener() void
+hasEventListener() boolean
+hasEventListener() boolean
+removeEventListener() void
+removeEventListener() void
+dispatchEvent() void
        }
class BaseEvent~TEventType~ {
            <<interface>>
            +type: TEventType
            
        }
class Event~TEventType,TTarget~ {
            <<interface>>
            +type: TEventType
+target: TTarget
            
        }
class GLBufferAttribute{
            +isGLBufferAttribute: true
+name: string
+buffer: WebGLBuffer
+type: number
+itemSize: number
+elementSize: 1 | 2 | 4
+count: number
+version: number
            +setBuffer() this
+setType() this
+setItemSize() this
+setCount() this
        }
class InstancedBufferAttribute{
            +meshPerAttribute: number
+isInstancedBufferAttribute: true
            
        }
BufferAttribute<|--InstancedBufferAttribute
class InstancedBufferGeometry{
            +type: string
+isInstancedBufferGeometry: true
+instanceCount: number
            +copy() this
        }
BufferGeometry~Attributes~<|--InstancedBufferGeometry
class InstancedInterleavedBuffer{
            +meshPerAttribute: number
            
        }
InterleavedBuffer<|--InstancedInterleavedBuffer
class InterleavedBuffer{
            +array: TypedArray
+stride: number
+usage: Usage
+updateRange: #123; offset: number; count: number; #125;
+updateRanges: #123; start: number; count: number; #125;[]
+version: number
+count: number
+uuid: string
            +set() this
+setUsage() this
+addUpdateRange() void
+clearUpdateRanges() void
+copy() this
+copyAt() this
+clone() InterleavedBuffer
+toJSON() #123; uuid: string; buffer: string; type: string; stride: number; #125;
        }
class InterleavedBufferAttribute{
            +name: string
+data: InterleavedBuffer
+itemSize: number
+offset: number
+normalized: boolean
+isInterleavedBufferAttribute: true
            +applyMatrix4() this
+applyNormalMatrix() this
+transformDirection() this
+getComponent() number
+setComponent() this
+getX() number
+setX() this
+getY() number
+setY() this
+getZ() number
+setZ() this
+getW() number
+setW() this
+setXY() this
+setXYZ() this
+setXYZW() this
+clone() BufferAttribute
+toJSON() #123; isInterleavedBufferAttribute: true; itemSize: number; data: string; offset: number; normalized: boolean; #125;
        }
class Layers{
            +mask: number
            +set() void
+enable() void
+enableAll() void
+toggle() void
+disable() void
+disableAll() void
+test() boolean
+isEnabled() boolean
        }
class Object3D~TEventMap~{
            +isObject3D: true
+id: number
+uuid: string
+name: string
+type: string
+parent: Object3D~Object3DEventMap~
+children: Object3D~Object3DEventMap~[]
+up: Vector3
+position: Vector3
+rotation: Euler
+quaternion: Quaternion
+scale: Vector3
+modelViewMatrix: Matrix4
+normalMatrix: Matrix3
+matrix: Matrix4
+matrixWorld: Matrix4
+matrixAutoUpdate: boolean
+matrixWorldAutoUpdate: boolean
+matrixWorldNeedsUpdate: boolean
+layers: Layers
+visible: boolean
+castShadow: boolean
+receiveShadow: boolean
+frustumCulled: boolean
+renderOrder: number
+animations: AnimationClip[]
+userData: Record~string, any~
+customDepthMaterial?: Material
+customDistanceMaterial?: Material
+DEFAULT_UP: Vector3$
+DEFAULT_MATRIX_AUTO_UPDATE: boolean$
+DEFAULT_MATRIX_WORLD_AUTO_UPDATE: boolean$
            +onBeforeShadow() void
+onAfterShadow() void
+onBeforeRender() void
+onAfterRender() void
+applyMatrix4() void
+applyQuaternion() this
+setRotationFromAxisAngle() void
+setRotationFromEuler() void
+setRotationFromMatrix() void
+setRotationFromQuaternion() void
+rotateOnAxis() this
+rotateOnWorldAxis() this
+rotateX() this
+rotateY() this
+rotateZ() this
+translateOnAxis() this
+translateX() this
+translateY() this
+translateZ() this
+localToWorld() Vector3
+worldToLocal() Vector3
+lookAt() void
+lookAt() void
+add() this
+remove() this
+removeFromParent() this
+clear() this
+attach() this
+getObjectById() Object3D~Object3DEventMap~
+getObjectByName() Object3D~Object3DEventMap~
+getObjectByProperty() Object3D~Object3DEventMap~
+getObjectsByProperty() Object3D~Object3DEventMap~[]
+getWorldPosition() Vector3
+getWorldQuaternion() Quaternion
+getWorldScale() Vector3
+getWorldDirection() Vector3
+raycast() void
+traverse() void
+traverseVisible() void
+traverseAncestors() void
+updateMatrix() void
+updateMatrixWorld() void
+updateWorldMatrix() void
+toJSON() any
+clone() this
+copy() this
        }
class Object3DEventMap {
            <<interface>>
            +added: #123;#125;
+removed: #123;#125;
+childadded: #123; child: Object3D~Object3DEventMap~; #125;
+childremoved: #123; child: Object3D~Object3DEventMap~; #125;
            
        }
EventDispatcher~TEventMap~<|--Object3D~TEventMap~
class Raycaster{
            +ray: Ray
+near: number
+far: number
+camera: Camera
+layers: Layers
+params: RaycasterParameters
            +set() void
+setFromCamera() void
+setFromXRController() this
+intersectObject() Intersection~TIntersected~[]
+intersectObjects() Intersection~TIntersected~[]
        }
class Face {
            <<interface>>
            +a: number
+b: number
+c: number
+normal: Vector3
+materialIndex: number
            
        }
class Intersection~TIntersected~ {
            <<interface>>
            +distance: number
+distanceToRay?: number
+point: Vector3
+index?: number
+face?: Face
+faceIndex?: number
+object: TIntersected
+uv?: Vector2
+uv1?: Vector2
+normal?: Vector3
+instanceId?: number
+pointOnLine?: Vector3
+batchId?: number
            
        }
class RaycasterParameters {
            <<interface>>
            +Mesh: any
+Line: #123; threshold: number; #125;
+Line2?: #123; threshold: number; #125;
+LOD: any
+Points: #123; threshold: number; #125;
+Sprite: any
            
        }
class RenderTarget~TTexture~{
            +isRenderTarget: true
+width: number
+height: number
+depth: number
+scissor: Vector4
+scissorTest: boolean
+viewport: Vector4
+textures: TTexture[]
+depthBuffer: boolean
+stencilBuffer: boolean
+depthTexture: DepthTexture
+samples: number
            +setSize() void
+clone() this
+copy() this
+dispose() void
        }
class RenderTargetOptions {
            <<interface>>
            +wrapS?: Wrapping
+wrapT?: Wrapping
+magFilter?: MagnificationTextureFilter
+minFilter?: MinificationTextureFilter
+generateMipmaps?: boolean
+format?: number
+type?: TextureDataType
+anisotropy?: number
+colorSpace?: ColorSpace
+internalFormat?: PixelFormatGPU
+depthBuffer?: boolean
+stencilBuffer?: boolean
+depthTexture?: DepthTexture
+samples?: number
+count?: number
            
        }
EventDispatcher~TEventMap~<|--RenderTarget~TTexture~
class Uniform~T~{
            +value: T
            +clone() Uniform~T~
        }
class UniformsGroup{
            +isUniformsGroup: true
+id: number
+usage: Usage
+uniforms: (Uniform~any~ | Uniform~any~[])[]
            +add() this
+remove() this
+setName() this
+setUsage() this
+dispose() this
+copy() this
+clone() UniformsGroup
        }
EventDispatcher~TEventMap~<|--UniformsGroup
class PMREMGenerator{
            
            +fromScene() WebGLRenderTarget~Texture~
+fromEquirectangular() WebGLRenderTarget~Texture~
+fromCubemap() WebGLRenderTarget~Texture~
+compileCubemapShader() void
+compileEquirectangularShader() void
+dispose() void
        }
class Vec2 {
            <<interface>>
            +x: number
+y: number
            
        }
class BoxGeometry{
            +type: string
+parameters: #123; readonly width: number; readonly height: number; readonly depth: number; readonly widthSegments: number; readonly heightSegments: number; readonly depthSegments: number; #125;
            +fromJSON() BoxGeometry$
        }
BufferGeometry~Attributes~<|--BoxGeometry
class CapsuleGeometry{
            +type: string
+parameters: #123; readonly radius: number; readonly length: number; readonly capSegments: number; readonly radialSegments: number; #125;
            +fromJSON() CapsuleGeometry$
        }
BufferGeometry~Attributes~<|--CapsuleGeometry
class CircleGeometry{
            +type: string
+parameters: #123; readonly radius: number; readonly segments: number; readonly thetaStart: number; readonly thetaLength: number; #125;
            +fromJSON() CircleGeometry$
        }
BufferGeometry~Attributes~<|--CircleGeometry
class ConeGeometry{
            +type: string
+parameters: #123; readonly radius: number; readonly radiusTop: number; readonly radiusBottom: number; readonly height: number; readonly radialSegments: number; readonly heightSegments: number; readonly openEnded: boolean; readonly thetaStart: number; readonly thetaLength: number; #125;
            +fromJSON() ConeGeometry$
        }
CylinderGeometry<|--ConeGeometry
class CylinderGeometry{
            +type: string
+parameters: #123; readonly radiusTop: number; readonly radiusBottom: number; readonly height: number; readonly radialSegments: number; readonly heightSegments: number; readonly openEnded: boolean; readonly thetaStart: number; readonly thetaLength: number; #125;
            +fromJSON() CylinderGeometry$
        }
BufferGeometry~Attributes~<|--CylinderGeometry
class DodecahedronGeometry{
            +type: string
            +fromJSON() DodecahedronGeometry$
        }
PolyhedronGeometry<|--DodecahedronGeometry
class EdgesGeometry~TBufferGeometry~{
            +type: string
+parameters: #123; readonly geometry: TBufferGeometry; readonly thresholdAngle: number; #125;
            
        }
BufferGeometry~Attributes~<|--EdgesGeometry~TBufferGeometry~
class ExtrudeGeometry{
            +type: string
+parameters: #123; readonly shapes: Shape | Shape[]; readonly options: ExtrudeGeometryOptions; #125;
            +addShape() void
+fromJSON() ExtrudeGeometry$
        }
class ExtrudeGeometryOptions {
            <<interface>>
            +curveSegments?: number
+steps?: number
+depth?: number
+bevelEnabled?: boolean
+bevelThickness?: number
+bevelSize?: number
+bevelOffset?: number
+bevelSegments?: number
+extrudePath?: Curve~Vector3~
+UVGenerator?: UVGenerator
            
        }
class UVGenerator {
            <<interface>>
            
            +generateTopUV() Vector2[]
+generateSideWallUV() Vector2[]
        }
BufferGeometry~Attributes~<|--ExtrudeGeometry
class IcosahedronGeometry{
            +type: string
            +fromJSON() IcosahedronGeometry$
        }
PolyhedronGeometry<|--IcosahedronGeometry
class LatheGeometry{
            +type: string
+parameters: #123; readonly points: Vector2[]; readonly segments: number; readonly phiStart: number; readonly phiLength: number; #125;
            +fromJSON() LatheGeometry$
        }
BufferGeometry~Attributes~<|--LatheGeometry
class OctahedronGeometry{
            +type: string
            +fromJSON() OctahedronGeometry$
        }
PolyhedronGeometry<|--OctahedronGeometry
class PlaneGeometry{
            +type: string
+parameters: #123; readonly width: number; readonly height: number; readonly widthSegments: number; readonly heightSegments: number; #125;
            +fromJSON() PlaneGeometry$
        }
BufferGeometry~Attributes~<|--PlaneGeometry
class PolyhedronGeometry{
            +type: string
+parameters: #123; readonly vertices: number[]; readonly indices: number[]; readonly radius: number; readonly detail: number; #125;
            +fromJSON() PolyhedronGeometry$
        }
BufferGeometry~Attributes~<|--PolyhedronGeometry
class RingGeometry{
            +type: string
+parameters: #123; readonly innerRadius: number; readonly outerRadius: number; readonly thetaSegments: number; readonly phiSegments: number; readonly thetaStart: number; readonly thetaLength: number; #125;
            +fromJSON() RingGeometry$
        }
BufferGeometry~Attributes~<|--RingGeometry
class ShapeGeometry{
            +type: string
+parameters: #123; readonly shapes: Shape | Shape[]; readonly curveSegments: number; #125;
            +fromJSON() ShapeGeometry$
        }
BufferGeometry~Attributes~<|--ShapeGeometry
class SphereGeometry{
            +type: string
+parameters: #123; readonly radius: number; readonly widthSegments: number; readonly heightSegments: number; readonly phiStart: number; readonly phiLength: number; readonly thetaStart: number; readonly thetaLength: number; #125;
            +fromJSON() SphereGeometry$
        }
BufferGeometry~Attributes~<|--SphereGeometry
class TetrahedronGeometry{
            +type: string
            +fromJSON() TetrahedronGeometry$
        }
PolyhedronGeometry<|--TetrahedronGeometry
class TorusGeometry{
            +type: string
+parameters: #123; readonly radius: number; readonly tube: number; readonly radialSegments: number; readonly tubularSegments: number; readonly arc: number; #125;
            +fromJSON() TorusGeometry$
        }
BufferGeometry~Attributes~<|--TorusGeometry
class TorusKnotGeometry{
            +type: string
+parameters: #123; readonly radius: number; readonly tube: number; readonly tubularSegments: number; readonly radialSegments: number; readonly p: number; readonly q: number; #125;
            +fromJSON() TorusKnotGeometry$
        }
BufferGeometry~Attributes~<|--TorusKnotGeometry
class TubeGeometry{
            +type: string
+parameters: #123; readonly path: Curve~Vector3~; readonly tubularSegments: number; readonly radius: number; readonly radialSegments: number; readonly closed: boolean; #125;
+tangents: Vector3[]
+normals: Vector3[]
+binormals: Vector3[]
            +fromJSON() TubeGeometry$
        }
BufferGeometry~Attributes~<|--TubeGeometry
class WireframeGeometry~TBufferGeometry~{
            +type: string
+parameters: #123; readonly geometry: TBufferGeometry; #125;
            
        }
BufferGeometry~Attributes~<|--WireframeGeometry~TBufferGeometry~
class ArrowHelper{
            +type: string
+line: Line~BufferGeometry~NormalBufferAttributes~, Material | Material[], Object3DEventMap~
+cone: Mesh~BufferGeometry~NormalBufferAttributes~, Material | Material[], Object3DEventMap~
            +setColor() void
+setDirection() void
+setLength() void
+copy() this
+dispose() void
        }
Object3D~TEventMap~<|--ArrowHelper
class AxesHelper{
            +type: string
            +setColors() this
+dispose() void
        }
LineSegments~TGeometry,TMaterial,TEventMap~<|--AxesHelper
class Box3Helper{
            +type: string
+box: Box3
            +dispose() void
        }
LineSegments~TGeometry,TMaterial,TEventMap~<|--Box3Helper
class BoxHelper{
            +type: string
            +update() void
+setFromObject() this
+dispose() void
        }
LineSegments~TGeometry,TMaterial,TEventMap~<|--BoxHelper
class CameraHelper{
            +type: string
+camera: Camera
+pointMap: #123; [id: string]: number[]; #125;
+matrix: Matrix4
+matrixAutoUpdate: boolean
            +setColors() this
+update() void
+dispose() void
        }
LineSegments~TGeometry,TMaterial,TEventMap~<|--CameraHelper
class DirectionalLightHelper{
            +type: string
+lightPlane: Line~BufferGeometry~NormalBufferAttributes~, Material | Material[], Object3DEventMap~
+light: DirectionalLight
+matrix: Matrix4
+matrixAutoUpdate: boolean
+color: ColorRepresentation
+targetLine: Line~BufferGeometry~NormalBufferAttributes~, Material | Material[], Object3DEventMap~
            +update() void
+dispose() void
        }
Object3D~TEventMap~<|--DirectionalLightHelper
class GridHelper{
            +type: string
            +dispose() void
        }
LineSegments~TGeometry,TMaterial,TEventMap~<|--GridHelper
class HemisphereLightHelper{
            +type: string
+light: HemisphereLight
+matrix: Matrix4
+matrixAutoUpdate: boolean
+material: MeshBasicMaterial
+color: ColorRepresentation
            +update() void
+dispose() void
        }
Object3D~TEventMap~<|--HemisphereLightHelper
class PlaneHelper{
            +type: string
+plane: Plane
+size: number
            +dispose() void
        }
LineSegments~TGeometry,TMaterial,TEventMap~<|--PlaneHelper
class PointLightHelper{
            +type: string
+light: PointLight
+matrix: Matrix4
+color: ColorRepresentation
+matrixAutoUpdate: boolean
            +update() void
+dispose() void
        }
Object3D~TEventMap~<|--PointLightHelper
class PolarGridHelper{
            +type: string
            +dispose() void
        }
LineSegments~TGeometry,TMaterial,TEventMap~<|--PolarGridHelper
class SkeletonHelper{
            +isSkeletonHelper: true
+type: string
+bones: Bone~Object3DEventMap~[]
+root: Object3D~Object3DEventMap~ | SkinnedMesh~BufferGeometry~NormalBufferAttributes~, Material | Material[], Object3DEventMap~
+matrix: Matrix4
+matrixAutoUpdate: boolean
            +update() void
+dispose() void
        }
LineSegments~TGeometry,TMaterial,TEventMap~<|--SkeletonHelper
class SpotLightHelper{
            +type: string
+cone: LineSegments~BufferGeometry~NormalBufferAttributes~, Material | Material[], Object3DEventMap~
+light: Light~LightShadow~Camera~~
+matrix: Matrix4
+color: ColorRepresentation
+matrixAutoUpdate: boolean
            +update() void
+dispose() void
        }
Object3D~TEventMap~<|--SpotLightHelper
class AmbientLight{
            +isAmbientLight: true
+type: string
            
        }
Light~TShadowSupport~<|--AmbientLight
class DirectionalLight{
            +isDirectionalLight: true
+type: string
+castShadow: boolean
+position: Vector3
+shadow: DirectionalLightShadow
+target: Object3D~Object3DEventMap~
            +dispose() void
        }
Light~TShadowSupport~<|--DirectionalLight
class DirectionalLightShadow{
            +isDirectionalLightShadow: true
+camera: OrthographicCamera
            
        }
LightShadow~TCamera~<|--DirectionalLightShadow
class HemisphereLight{
            +isHemisphereLight: true
+type: string
+position: Vector3
+color: Color
+groundColor: Color
            
        }
Light~TShadowSupport~<|--HemisphereLight
class Light~TShadowSupport~{
            +isLight: true
+type: string
+color: Color
+intensity: number
+shadow: TShadowSupport
            +copy() this
+dispose() void
        }
Object3D~TEventMap~<|--Light~TShadowSupport~
class LightProbe{
            +isLightProbe: true
+sh: SphericalHarmonics3
            +fromJSON() LightProbe
        }
Light~TShadowSupport~<|--LightProbe
class LightShadow~TCamera~{
            +camera: TCamera
+bias: number
+normalBias: number
+radius: number
+blurSamples: number
+mapSize: Vector2
+map: WebGLRenderTarget~Texture~
+mapPass: WebGLRenderTarget~Texture~
+matrix: Matrix4
+autoUpdate: boolean
+needsUpdate: boolean
            +getViewportCount() number
+copy() this
+clone() this
+toJSON() #123;#125;
+getFrustum() Frustum
+updateMatrices() void
+getViewport() Vector4
+getFrameExtents() Vector2
+dispose() void
        }
class PointLight{
            +isPointLight: true
+type: string
+intensity: number
+distance: number
+castShadow: boolean
+decay: number
+shadow: PointLightShadow
+power: number
            
        }
Light~TShadowSupport~<|--PointLight
class PointLightShadow{
            +isPointLightShadow: true
            +updateMatrices() void
        }
LightShadow~TCamera~<|--PointLightShadow
class RectAreaLight{
            +isRectAreaLight: true
+type: string
+width: number
+height: number
+intensity: number
+power: number
            
        }
Light~TShadowSupport~<|--RectAreaLight
class SpotLight{
            +isSpotLight: true
+type: string
+position: Vector3
+target: Object3D~Object3DEventMap~
+castShadow: boolean
+intensity: number
+distance: number
+angle: number
+decay: number
+shadow: SpotLightShadow
+power: number
+penumbra: number
+map: Texture
            
        }
Light~TShadowSupport~<|--SpotLight
class SpotLightShadow{
            +isSpotLightShadow: true
+camera: PerspectiveCamera
+focus: number
            
        }
LightShadow~TCamera~<|--SpotLightShadow
class AnimationLoader{
            
            +parse() AnimationClip[]
        }
Loader~TData,TUrl~<|--AnimationLoader
class AudioLoader{
            
            
        }
Loader~TData,TUrl~<|--AudioLoader
class BufferGeometryLoader{
            
            +parse() BufferGeometry~NormalBufferAttributes~ | InstancedBufferGeometry
        }
Loader~TData,TUrl~<|--BufferGeometryLoader
class CompressedTextureLoader{
            
            +load() CompressedTexture
        }
Loader~TData,TUrl~<|--CompressedTextureLoader
class CubeTextureLoader{
            
            +load() CubeTexture
        }
Loader~TData,TUrl~<|--CubeTextureLoader
class DataTextureLoader{
            
            +load() DataTexture
        }
Loader~TData,TUrl~<|--DataTextureLoader
class FileLoader{
            +mimeType: MimeType
+responseType: string
            +load() void
+setMimeType() FileLoader
+setResponseType() FileLoader
        }
Loader~TData,TUrl~<|--FileLoader
class ImageBitmapLoader{
            +options: object
+isImageBitmapLoader: true
            +load() void
+setOptions() ImageBitmapLoader
        }
Loader~TData,TUrl~<|--ImageBitmapLoader
class ImageLoader{
            
            +load() HTMLImageElement
        }
Loader~TData,TUrl~<|--ImageLoader
class Loader~TData,TUrl~{
            +crossOrigin: string
+withCredentials: boolean
+path: string
+resourcePath: string
+manager: LoadingManager
+requestHeader: #123; [header: string]: string; #125;
+DEFAULT_MATERIAL_NAME: string$
            +load() void
+loadAsync() Promise~TData~
+setCrossOrigin() this
+setWithCredentials() this
+setPath() this
+setResourcePath() this
+setRequestHeader() this
        }
class LoaderUtils {
            <<interface>>
            
            +decodeText() string
+extractUrlBase() string
+resolveURL() string
        }
class LoadingManager{
            +onStart?: (url: string, loaded: number, total: number) =~ void
+onLoad: () =~ void
+onProgress: (url: string, loaded: number, total: number) =~ void
+onError: (url: string) =~ void
            +setURLModifier() this
+resolveURL() string
+itemStart() void
+itemEnd() void
+itemError() void
+addHandler() this
+removeHandler() this
+getHandler() Loader~unknown, string~
        }
class MaterialLoader{
            +textures: #123; [key: string]: Texture; #125;
            +parse() Material
+setTextures() this
+createMaterialFromType() Material$
        }
Loader~TData,TUrl~<|--MaterialLoader
class ObjectLoader{
            
            +load() void
+parse() Object3D~Object3DEventMap~
+parseAsync() Promise~Object3D~Object3DEventMap~~
+parseGeometries() #123; [key: string]: BufferGeometry~NormalBufferAttributes~ | InstancedBufferGeometry; #125;
+parseMaterials() #123; [key: string]: Material; #125;
+parseAnimations() #123; [key: string]: AnimationClip; #125;
+parseImages() #123; [key: string]: Source; #125;
+parseImagesAsync() Promise~#123; [key: string]: Source; #125;~
+parseTextures() #123; [key: string]: Texture; #125;
+parseObject() Object3D~Object3DEventMap~
        }
Loader~TData,TUrl~<|--ObjectLoader
class TextureLoader{
            
            +load() Texture
        }
Loader~TData,TUrl~<|--TextureLoader
class LineBasicMaterial{
            +isLineBasicMaterial: true
+type: string
+color: Color
+fog: boolean
+linewidth: number
+linecap: string
+linejoin: string
+map: Texture
            +setValues() void
        }
class LineBasicMaterialParameters {
            <<interface>>
            +color?: ColorRepresentation
+fog?: boolean
+linewidth?: number
+linecap?: string
+linejoin?: string
            
        }
Material<|--LineBasicMaterial
MaterialParameters<|..LineBasicMaterialParameters
class LineDashedMaterial{
            +isLineDashedMaterial: true
+type: string
+scale: number
+dashSize: number
+gapSize: number
            +setValues() void
        }
class LineDashedMaterialParameters {
            <<interface>>
            +scale?: number
+dashSize?: number
+gapSize?: number
            
        }
LineBasicMaterial<|--LineDashedMaterial
LineBasicMaterialParameters<|..LineDashedMaterialParameters
class Material{
            +isMaterial: true
+alphaHash: boolean
+alphaToCoverage: boolean
+blendAlpha: number
+blendColor: Color
+blendDst: BlendingDstFactor
+blendDstAlpha: number
+blendEquation: BlendingEquation
+blendEquationAlpha: number
+blending: Blending
+blendSrc: 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 211 | 212 | 213 | 214 | 210
+blendSrcAlpha: number
+clipIntersection: boolean
+clippingPlanes: Plane[]
+clipShadows: boolean
+colorWrite: boolean
+defines: #123; [key: string]: any; #125;
+depthFunc: DepthModes
+depthTest: boolean
+depthWrite: boolean
+id: number
+stencilWrite: boolean
+stencilFunc: StencilFunc
+stencilRef: number
+stencilWriteMask: number
+stencilFuncMask: number
+stencilFail: StencilOp
+stencilZFail: StencilOp
+stencilZPass: StencilOp
+name: string
+opacity: number
+polygonOffset: boolean
+polygonOffsetFactor: number
+polygonOffsetUnits: number
+precision: "highp" | "mediump" | "lowp"
+premultipliedAlpha: boolean
+forceSinglePass: boolean
+dithering: boolean
+side: Side
+shadowSide: Side
+toneMapped: boolean
+transparent: boolean
+type: string
+uuid: string
+vertexColors: boolean
+visible: boolean
+userData: Record~string, any~
+version: number
            +onBuild() void
+onBeforeRender() void
+onBeforeCompile() void
+customProgramCacheKey() string
+setValues() void
+toJSON() any
+clone() this
+copy() this
+dispose() void
        }
class MaterialParameters {
            <<interface>>
            +alphaHash?: boolean
+alphaTest?: number
+alphaToCoverage?: boolean
+blendAlpha?: number
+blendColor?: ColorRepresentation
+blendDst?: BlendingDstFactor
+blendDstAlpha?: number
+blendEquation?: BlendingEquation
+blendEquationAlpha?: number
+blending?: Blending
+blendSrc?: 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 211 | 212 | 213 | 214 | 210
+blendSrcAlpha?: number
+clipIntersection?: boolean
+clippingPlanes?: Plane[]
+clipShadows?: boolean
+colorWrite?: boolean
+defines?: any
+depthFunc?: DepthModes
+depthTest?: boolean
+depthWrite?: boolean
+name?: string
+opacity?: number
+polygonOffset?: boolean
+polygonOffsetFactor?: number
+polygonOffsetUnits?: number
+precision?: "highp" | "mediump" | "lowp"
+premultipliedAlpha?: boolean
+forceSinglePass?: boolean
+dithering?: boolean
+side?: Side
+shadowSide?: Side
+toneMapped?: boolean
+transparent?: boolean
+vertexColors?: boolean
+visible?: boolean
+format?: PixelFormat
+stencilWrite?: boolean
+stencilFunc?: StencilFunc
+stencilRef?: number
+stencilWriteMask?: number
+stencilFuncMask?: number
+stencilFail?: StencilOp
+stencilZFail?: StencilOp
+stencilZPass?: StencilOp
+userData?: Record~string, any~
            
        }
EventDispatcher~TEventMap~<|--Material
class MeshBasicMaterial{
            +isMeshBasicMaterial: true
+type: string
+color: Color
+map: Texture
+lightMap: Texture
+lightMapIntensity: number
+aoMap: Texture
+aoMapIntensity: number
+specularMap: Texture
+alphaMap: Texture
+envMap: Texture
+envMapRotation: Euler
+combine: Combine
+reflectivity: number
+refractionRatio: number
+wireframe: boolean
+wireframeLinewidth: number
+wireframeLinecap: string
+wireframeLinejoin: string
+fog: boolean
            +setValues() void
        }
class MeshBasicMaterialParameters {
            <<interface>>
            +color?: ColorRepresentation
+opacity?: number
+map?: Texture
+lightMap?: Texture
+lightMapIntensity?: number
+aoMap?: Texture
+aoMapIntensity?: number
+specularMap?: Texture
+alphaMap?: Texture
+fog?: boolean
+envMap?: Texture
+envMapRotation?: Euler
+combine?: Combine
+reflectivity?: number
+refractionRatio?: number
+wireframe?: boolean
+wireframeLinewidth?: number
+wireframeLinecap?: string
+wireframeLinejoin?: string
            
        }
Material<|--MeshBasicMaterial
MaterialParameters<|..MeshBasicMaterialParameters
class MeshDepthMaterial{
            +isMeshDepthMaterial: true
+type: string
+map: Texture
+alphaMap: Texture
+depthPacking: DepthPackingStrategies
+displacementMap: Texture
+displacementScale: number
+displacementBias: number
+wireframe: boolean
+wireframeLinewidth: number
+fog: boolean
            +setValues() void
        }
class MeshDepthMaterialParameters {
            <<interface>>
            +map?: Texture
+alphaMap?: Texture
+depthPacking?: DepthPackingStrategies
+displacementMap?: Texture
+displacementScale?: number
+displacementBias?: number
+wireframe?: boolean
+wireframeLinewidth?: number
            
        }
Material<|--MeshDepthMaterial
MaterialParameters<|..MeshDepthMaterialParameters
class MeshDistanceMaterial{
            +isMeshDistanceMaterial: true
+type: string
+map: Texture
+alphaMap: Texture
+displacementMap: Texture
+displacementScale: number
+displacementBias: number
+fog: boolean
            +setValues() void
        }
class MeshDistanceMaterialParameters {
            <<interface>>
            +map?: Texture
+alphaMap?: Texture
+displacementMap?: Texture
+displacementScale?: number
+displacementBias?: number
+farDistance?: number
+nearDistance?: number
+referencePosition?: Vector3
            
        }
Material<|--MeshDistanceMaterial
MaterialParameters<|..MeshDistanceMaterialParameters
class MeshLambertMaterial{
            +isMeshLambertMaterial: true
+type: string
+color: Color
+bumpMap: Texture
+bumpScale: number
+displacementMap: Texture
+displacementScale: number
+displacementBias: number
+emissive: Color
+emissiveIntensity: number
+emissiveMap: Texture
+flatShading: boolean
+map: Texture
+lightMap: Texture
+lightMapIntensity: number
+normalMap: Texture
+normalMapType: NormalMapTypes
+normalScale: Vector2
+aoMap: Texture
+aoMapIntensity: number
+specularMap: Texture
+alphaMap: Texture
+envMap: Texture
+envMapRotation: Euler
+combine: Combine
+reflectivity: number
+refractionRatio: number
+wireframe: boolean
+wireframeLinewidth: number
+wireframeLinecap: string
+wireframeLinejoin: string
+fog: boolean
            +setValues() void
        }
class MeshLambertMaterialParameters {
            <<interface>>
            +bumpMap?: Texture
+bumpScale?: number
+color?: ColorRepresentation
+displacementMap?: Texture
+displacementScale?: number
+displacementBias?: number
+emissive?: ColorRepresentation
+emissiveIntensity?: number
+emissiveMap?: Texture
+flatShading?: boolean
+map?: Texture
+lightMap?: Texture
+lightMapIntensity?: number
+normalMap?: Texture
+normalScale?: Vector2
+aoMap?: Texture
+aoMapIntensity?: number
+specularMap?: Texture
+alphaMap?: Texture
+envMap?: Texture
+envMapRotation?: Euler
+combine?: Combine
+reflectivity?: number
+refractionRatio?: number
+wireframe?: boolean
+wireframeLinewidth?: number
+wireframeLinecap?: string
+wireframeLinejoin?: string
+fog?: boolean
            
        }
Material<|--MeshLambertMaterial
MaterialParameters<|..MeshLambertMaterialParameters
class MeshMatcapMaterial{
            +isMeshMatcapMaterial: true
+type: string
+defines: #123; [key: string]: any; #125;
+color: Color
+matcap: Texture
+map: Texture
+bumpMap: Texture
+bumpScale: number
+normalMap: Texture
+normalMapType: NormalMapTypes
+normalScale: Vector2
+displacementMap: Texture
+displacementScale: number
+displacementBias: number
+alphaMap: Texture
+flatShading: boolean
+fog: boolean
            +setValues() void
        }
class MeshMatcapMaterialParameters {
            <<interface>>
            +color?: ColorRepresentation
+matcap?: Texture
+map?: Texture
+bumpMap?: Texture
+bumpScale?: number
+normalMap?: Texture
+normalMapType?: NormalMapTypes
+normalScale?: Vector2
+displacementMap?: Texture
+displacementScale?: number
+displacementBias?: number
+alphaMap?: Texture
+fog?: boolean
+flatShading?: boolean
            
        }
Material<|--MeshMatcapMaterial
MaterialParameters<|..MeshMatcapMaterialParameters
class MeshNormalMaterial{
            +isMeshNormalMaterial: true
+type: string
+bumpMap: Texture
+bumpScale: number
+normalMap: Texture
+normalMapType: NormalMapTypes
+normalScale: Vector2
+displacementMap: Texture
+displacementScale: number
+displacementBias: number
+wireframe: boolean
+wireframeLinewidth: number
+flatShading: boolean
            +setValues() void
        }
class MeshNormalMaterialParameters {
            <<interface>>
            +bumpMap?: Texture
+bumpScale?: number
+normalMap?: Texture
+normalMapType?: NormalMapTypes
+normalScale?: Vector2
+displacementMap?: Texture
+displacementScale?: number
+displacementBias?: number
+wireframe?: boolean
+wireframeLinewidth?: number
+flatShading?: boolean
            
        }
Material<|--MeshNormalMaterial
MaterialParameters<|..MeshNormalMaterialParameters
class MeshPhongMaterial{
            +isMeshPhongMaterial: true
+type: string
+color: Color
+specular: Color
+shininess: number
+map: Texture
+lightMap: Texture
+lightMapIntensity: number
+aoMap: Texture
+aoMapIntensity: number
+emissive: Color
+emissiveIntensity: number
+emissiveMap: Texture
+bumpMap: Texture
+bumpScale: number
+normalMap: Texture
+normalMapType: NormalMapTypes
+normalScale: Vector2
+displacementMap: Texture
+displacementScale: number
+displacementBias: number
+specularMap: Texture
+alphaMap: Texture
+envMap: Texture
+envMapRotation: Euler
+combine: Combine
+reflectivity: number
+refractionRatio: number
+wireframe: boolean
+wireframeLinewidth: number
+wireframeLinecap: string
+wireframeLinejoin: string
+flatShading: boolean
+metal: boolean
+fog: boolean
            +setValues() void
        }
class MeshPhongMaterialParameters {
            <<interface>>
            +color?: ColorRepresentation
+specular?: ColorRepresentation
+shininess?: number
+opacity?: number
+map?: Texture
+lightMap?: Texture
+lightMapIntensity?: number
+aoMap?: Texture
+aoMapIntensity?: number
+emissive?: ColorRepresentation
+emissiveIntensity?: number
+emissiveMap?: Texture
+bumpMap?: Texture
+bumpScale?: number
+normalMap?: Texture
+normalMapType?: NormalMapTypes
+normalScale?: Vector2
+displacementMap?: Texture
+displacementScale?: number
+displacementBias?: number
+specularMap?: Texture
+alphaMap?: Texture
+envMap?: Texture
+envMapRotation?: Euler
+combine?: Combine
+reflectivity?: number
+refractionRatio?: number
+wireframe?: boolean
+wireframeLinewidth?: number
+wireframeLinecap?: string
+wireframeLinejoin?: string
+fog?: boolean
+flatShading?: boolean
            
        }
Material<|--MeshPhongMaterial
MaterialParameters<|..MeshPhongMaterialParameters
class MeshPhysicalMaterial{
            +isMeshPhysicalMaterial: true
+type: string
+defines: #123; [key: string]: any; #125;
+clearcoat: number
+clearcoatMap: Texture
+clearcoatRoughness: number
+clearcoatRoughnessMap: Texture
+clearcoatNormalScale: Vector2
+clearcoatNormalMap: Texture
+reflectivity: number
+ior: number
+sheen: number
+sheenColor: Color
+sheenColorMap: Texture
+sheenRoughness: number
+sheenRoughnessMap: Texture
+transmission: number
+transmissionMap: Texture
+thickness: number
+thicknessMap: Texture
+attenuationDistance: number
+attenuationColor: Color
+specularIntensity: number
+specularColor: Color
+specularIntensityMap: Texture
+specularColorMap: Texture
+iridescenceMap: Texture
+iridescenceIOR: number
+iridescence: number
+iridescenceThicknessRange: [number, number]
+iridescenceThicknessMap: Texture
+anisotropy?: number
+anisotropyRotation?: number
+anisotropyMap?: Texture
            
        }
class MeshPhysicalMaterialParameters {
            <<interface>>
            +clearcoat?: number
+clearcoatMap?: Texture
+clearcoatRoughness?: number
+clearcoatRoughnessMap?: Texture
+clearcoatNormalScale?: Vector2
+clearcoatNormalMap?: Texture
+reflectivity?: number
+ior?: number
+sheen?: number
+sheenColor?: ColorRepresentation
+sheenColorMap?: Texture
+sheenRoughness?: number
+sheenRoughnessMap?: Texture
+transmission?: number
+transmissionMap?: Texture
+thickness?: number
+thicknessMap?: Texture
+attenuationDistance?: number
+attenuationColor?: ColorRepresentation
+specularIntensity?: number
+specularColor?: ColorRepresentation
+specularIntensityMap?: Texture
+specularColorMap?: Texture
+iridescenceMap?: Texture
+iridescenceIOR?: number
+iridescence?: number
+iridescenceThicknessRange?: [number, number]
+iridescenceThicknessMap?: Texture
+anisotropy?: number
+anisotropyRotation?: number
+anisotropyMap?: Texture
            
        }
MeshStandardMaterial<|--MeshPhysicalMaterial
MeshStandardMaterialParameters<|..MeshPhysicalMaterialParameters
class MeshStandardMaterial{
            +isMeshStandardMaterial: true
+type: string
+defines: #123; [key: string]: any; #125;
+color: Color
+roughness: number
+metalness: number
+map: Texture
+lightMap: Texture
+lightMapIntensity: number
+aoMap: Texture
+aoMapIntensity: number
+emissive: Color
+emissiveIntensity: number
+emissiveMap: Texture
+bumpMap: Texture
+bumpScale: number
+normalMap: Texture
+normalMapType: NormalMapTypes
+normalScale: Vector2
+displacementMap: Texture
+displacementScale: number
+displacementBias: number
+roughnessMap: Texture
+metalnessMap: Texture
+alphaMap: Texture
+envMap: Texture
+envMapRotation: Euler
+envMapIntensity: number
+wireframe: boolean
+wireframeLinewidth: number
+wireframeLinecap: string
+wireframeLinejoin: string
+flatShading: boolean
+fog: boolean
            +setValues() void
        }
class MeshStandardMaterialParameters {
            <<interface>>
            +color?: ColorRepresentation
+roughness?: number
+metalness?: number
+map?: Texture
+lightMap?: Texture
+lightMapIntensity?: number
+aoMap?: Texture
+aoMapIntensity?: number
+emissive?: ColorRepresentation
+emissiveIntensity?: number
+emissiveMap?: Texture
+bumpMap?: Texture
+bumpScale?: number
+normalMap?: Texture
+normalMapType?: NormalMapTypes
+normalScale?: Vector2
+displacementMap?: Texture
+displacementScale?: number
+displacementBias?: number
+roughnessMap?: Texture
+metalnessMap?: Texture
+alphaMap?: Texture
+envMap?: Texture
+envMapRotation?: Euler
+envMapIntensity?: number
+wireframe?: boolean
+wireframeLinewidth?: number
+fog?: boolean
+flatShading?: boolean
            
        }
Material<|--MeshStandardMaterial
MaterialParameters<|..MeshStandardMaterialParameters
class MeshToonMaterial{
            +isMeshToonMaterial: true
+type: string
+defines: #123; [key: string]: any; #125;
+color: Color
+gradientMap: Texture
+map: Texture
+lightMap: Texture
+lightMapIntensity: number
+aoMap: Texture
+aoMapIntensity: number
+emissive: Color
+emissiveIntensity: number
+emissiveMap: Texture
+bumpMap: Texture
+bumpScale: number
+normalMap: Texture
+normalMapType: NormalMapTypes
+normalScale: Vector2
+displacementMap: Texture
+displacementScale: number
+displacementBias: number
+alphaMap: Texture
+wireframe: boolean
+wireframeLinewidth: number
+wireframeLinecap: string
+wireframeLinejoin: string
+fog: boolean
            +setValues() void
        }
class MeshToonMaterialParameters {
            <<interface>>
            +color?: ColorRepresentation
+opacity?: number
+gradientMap?: Texture
+map?: Texture
+lightMap?: Texture
+lightMapIntensity?: number
+aoMap?: Texture
+aoMapIntensity?: number
+emissive?: ColorRepresentation
+emissiveIntensity?: number
+emissiveMap?: Texture
+bumpMap?: Texture
+bumpScale?: number
+normalMap?: Texture
+normalMapType?: NormalMapTypes
+normalScale?: Vector2
+displacementMap?: Texture
+displacementScale?: number
+displacementBias?: number
+alphaMap?: Texture
+wireframe?: boolean
+wireframeLinewidth?: number
+wireframeLinecap?: string
+wireframeLinejoin?: string
+fog?: boolean
            
        }
Material<|--MeshToonMaterial
MaterialParameters<|..MeshToonMaterialParameters
class PointsMaterial{
            +isPointsMaterial: true
+type: string
+color: Color
+map: Texture
+alphaMap: Texture
+size: number
+sizeAttenuation: boolean
+fog: boolean
            +setValues() void
        }
class PointsMaterialParameters {
            <<interface>>
            +color?: ColorRepresentation
+map?: Texture
+alphaMap?: Texture
+size?: number
+sizeAttenuation?: boolean
+fog?: boolean
            
        }
Material<|--PointsMaterial
MaterialParameters<|..PointsMaterialParameters
class RawShaderMaterial{
            +isRawShaderMaterial: true
+type: "RawShaderMaterial"
            
        }
ShaderMaterial<|--RawShaderMaterial
class ShaderMaterial{
            +isShaderMaterial: true
+type: string
+defines: #123; [key: string]: any; #125;
+uniforms: #123; [uniform: string]: IUniform~any~; #125;
+uniformsGroups: UniformsGroup[]
+vertexShader: string
+fragmentShader: string
+linewidth: number
+wireframe: boolean
+wireframeLinewidth: number
+fog: boolean
+lights: boolean
+clipping: boolean
+extensions: #123; clipCullDistance: boolean; multiDraw: boolean; #125;
+defaultAttributeValues: any
+index0AttributeName: string
+uniformsNeedUpdate: boolean
+glslVersion: GLSLVersion
            +setValues() void
+toJSON() any
        }
class ShaderMaterialParameters {
            <<interface>>
            +uniforms?: #123; [uniform: string]: IUniform~any~; #125;
+uniformsGroups?: UniformsGroup[]
+vertexShader?: string
+fragmentShader?: string
+linewidth?: number
+wireframe?: boolean
+wireframeLinewidth?: number
+lights?: boolean
+clipping?: boolean
+fog?: boolean
+extensions?: #123; clipCullDistance?: boolean; multiDraw?: boolean; #125;
+glslVersion?: GLSLVersion
            
        }
Material<|--ShaderMaterial
MaterialParameters<|..ShaderMaterialParameters
class ShadowMaterial{
            +isShadowMaterial: true
+type: string
+color: Color
+transparent: boolean
+fog: boolean
            
        }
class ShadowMaterialParameters {
            <<interface>>
            +color?: ColorRepresentation
+fog?: boolean
            
        }
Material<|--ShadowMaterial
MaterialParameters<|..ShadowMaterialParameters
class SpriteMaterial{
            +isSpriteMaterial: true
+type: string
+color: Color
+map: Texture
+alphaMap: Texture
+rotation: number
+sizeAttenuation: boolean
+transparent: boolean
+fog: boolean
            +setValues() void
+copy() this
        }
class SpriteMaterialParameters {
            <<interface>>
            +color?: ColorRepresentation
+map?: Texture
+alphaMap?: Texture
+rotation?: number
+sizeAttenuation?: boolean
+fog?: boolean
            
        }
Material<|--SpriteMaterial
MaterialParameters<|..SpriteMaterialParameters
class Box2{
            +min: Vector2
+max: Vector2
            +set() Box2
+setFromPoints() Box2
+setFromCenterAndSize() Box2
+clone() this
+copy() this
+makeEmpty() Box2
+isEmpty() boolean
+getCenter() Vector2
+getSize() Vector2
+expandByPoint() Box2
+expandByVector() Box2
+expandByScalar() Box2
+containsPoint() boolean
+containsBox() boolean
+getParameter() Vector2
+intersectsBox() boolean
+clampPoint() Vector2
+distanceToPoint() number
+intersect() Box2
+union() Box2
+translate() Box2
+equals() boolean
+empty() any
+isIntersectionBox() any
        }
class Box3{
            +min: Vector3
+max: Vector3
+isBox3: true
            +set() this
+setFromArray() this
+setFromBufferAttribute() this
+setFromPoints() this
+setFromCenterAndSize() this
+setFromObject() this
+clone() this
+copy() this
+makeEmpty() this
+isEmpty() boolean
+getCenter() Vector3
+getSize() Vector3
+expandByPoint() this
+expandByVector() this
+expandByScalar() this
+expandByObject() this
+containsPoint() boolean
+containsBox() boolean
+getParameter() Vector3
+intersectsBox() boolean
+intersectsSphere() boolean
+intersectsPlane() boolean
+intersectsTriangle() boolean
+clampPoint() Vector3
+distanceToPoint() number
+getBoundingSphere() Sphere
+intersect() this
+union() this
+applyMatrix4() this
+translate() this
+equals() boolean
+empty() any
+isIntersectionBox() any
+isIntersectionSphere() any
        }
class Color{
            +isColor: true
+r: number
+g: number
+b: number
+NAMES: #123; aliceblue: 15792383; antiquewhite: 16444375; aqua: 65535; aquamarine: 8388564; azure: 15794175; beige: 16119260; bisque: 16770244; black: 0; blanchedalmond: 16772045; blue: 255; blueviolet: 9055202; ... 136 more ...; yellowgreen: 10145074; #125;$
            +set() this
+setFromVector3() this
+setScalar() Color
+setHex() Color
+setRGB() Color
+setHSL() Color
+setStyle() Color
+setColorName() Color
+clone() this
+copy() this
+copySRGBToLinear() Color
+copyLinearToSRGB() Color
+convertSRGBToLinear() Color
+convertLinearToSRGB() Color
+getHex() number
+getHexString() string
+getHSL() HSL
+getRGB() RGB
+getStyle() string
+offsetHSL() this
+add() this
+addColors() this
+addScalar() this
+applyMatrix3() this
+sub() this
+multiply() this
+multiplyScalar() this
+lerp() this
+lerpColors() this
+lerpHSL() this
+equals() boolean
+fromArray() this
+toArray() number[]
+toArray() ArrayLike~number~
+toJSON() number
+fromBufferAttribute() this
+__computed() Generator~number, void, unknown~
        }
class HSL {
            <<interface>>
            +h: number
+s: number
+l: number
            
        }
class RGB {
            <<interface>>
            +r: number
+g: number
+b: number
            
        }
class ColorManagement {
            <<interface>>
            +enabled: boolean
+convert: (color: Color, sourceColorSpace: DefinedColorSpace, targetColorSpace: DefinedColorSpace) =~ Color
+fromWorkingColorSpace: (color: Color, targetColorSpace: DefinedColorSpace) =~ Color
+toWorkingColorSpace: (color: Color, sourceColorSpace: DefinedColorSpace) =~ Color
+getPrimaries: (colorSpace: DefinedColorSpace) =~ ColorSpacePrimaries
+getTransfer: (colorSpace: ColorSpace) =~ ColorSpaceTransfer
            
        }
class Cylindrical{
            +radius: number
+theta: number
+y: number
            +clone() this
+copy() this
+set() this
+setFromVector3() this
+setFromCartesianCoords() this
        }
class Euler{
            +x: number
+y: number
+z: number
+order: EulerOrder
+isEuler: true
+_onChangeCallback: () =~ void
+DEFAULT_ORDER: "XYZ"$
            +set() Euler
+clone() this
+copy() this
+setFromRotationMatrix() Euler
+setFromQuaternion() Euler
+setFromVector3() Euler
+reorder() Euler
+equals() boolean
+fromArray() Euler
+toArray() (string | number)[]
+_onChange() this
+__computed() Generator~string | number, void, unknown~
        }
class Frustum{
            +planes: Plane[]
            +set() Frustum
+clone() this
+copy() this
+setFromProjectionMatrix() this
+intersectsObject() boolean
+intersectsSprite() boolean
+intersectsSphere() boolean
+intersectsBox() boolean
+containsPoint() boolean
        }
class Interpolant{
            +parameterPositions: any
+sampleValues: any
+valueSize: number
+resultBuffer: any
            +evaluate() any
        }
class Line3{
            +start: Vector3
+end: Vector3
            +set() Line3
+clone() this
+copy() this
+getCenter() Vector3
+delta() Vector3
+distanceSq() number
+distance() number
+at() Vector3
+closestPointToPointParameter() number
+closestPointToPoint() Vector3
+applyMatrix4() Line3
+equals() boolean
        }
class Matrix3{
            +elements: number[]
            +set() Matrix3
+identity() Matrix3
+clone() this
+copy() this
+extractBasis() Matrix3
+setFromMatrix4() Matrix3
+multiplyScalar() Matrix3
+determinant() number
+invert() Matrix3
+transpose() Matrix3
+getNormalMatrix() Matrix3
+transposeIntoArray() Matrix3
+setUvTransform() Matrix3
+scale() Matrix3
+makeTranslation() this
+makeTranslation() this
+makeRotation() this
+makeRotation() Matrix3
+makeScale() this
+makeScale() Matrix3
+rotate() Matrix3
+translate() Matrix3
+equals() boolean
+fromArray() Matrix3
+toArray() number[]
+toArray() Matrix3Tuple
+toArray() ArrayLike~number~
+multiply() Matrix3
+premultiply() Matrix3
+multiplyMatrices() Matrix3
+multiplyVector3() any
+multiplyVector3Array() any
+getInverse() Matrix3
+getInverse() Matrix
+flattenToArrayOffset() number[]
        }
class Matrix {
            <<interface>>
            +elements: number[]
            +identity() Matrix
+copy() this
+multiplyScalar() Matrix
+determinant() number
+transpose() Matrix
+invert() Matrix
+clone() Matrix
        }
Matrix<|..Matrix3
class Matrix4{
            +elements: number[]
            +set() this
+identity() this
+clone() Matrix4
+copy() this
+copyPosition() this
+extractBasis() this
+makeBasis() this
+extractRotation() this
+makeRotationFromEuler() this
+makeRotationFromQuaternion() this
+lookAt() this
+multiply() this
+premultiply() this
+multiplyMatrices() this
+multiplyToArray() Matrix4
+multiplyScalar() this
+determinant() number
+transpose() this
+setPosition() this
+setPosition() this
+invert() this
+scale() this
+getMaxScaleOnAxis() number
+makeTranslation() this
+makeTranslation() this
+makeRotationX() this
+makeRotationY() this
+makeRotationZ() this
+makeRotationAxis() this
+makeScale() this
+makeShear() this
+compose() this
+decompose() this
+makePerspective() this
+makeOrthographic() this
+equals() boolean
+fromArray() this
+toArray() number[]
+toArray() Matrix4Tuple
+toArray() ArrayLike~number~
+setFromMatrix3() this
+extractPosition() Matrix4
+setRotationFromQuaternion() Matrix4
+multiplyVector3() any
+multiplyVector4() any
+multiplyVector3Array() number[]
+rotateAxis() void
+crossVector() void
+flattenToArrayOffset() number[]
+getInverse() Matrix
        }
Matrix<|..Matrix4
class Plane{
            +normal: Vector3
+constant: number
+isPlane: true
            +set() Plane
+setComponents() Plane
+setFromNormalAndCoplanarPoint() Plane
+setFromCoplanarPoints() Plane
+clone() this
+copy() this
+normalize() Plane
+negate() Plane
+distanceToPoint() number
+distanceToSphere() number
+projectPoint() Vector3
+intersectLine() Vector3
+intersectsLine() boolean
+intersectsBox() boolean
+intersectsSphere() boolean
+coplanarPoint() Vector3
+applyMatrix4() Plane
+translate() Plane
+equals() boolean
+isIntersectionLine() any
        }
class Quaternion{
            +x: number
+y: number
+z: number
+w: number
+isQuaternion: true
+_onChangeCallback: () =~ void
            +set() this
+clone() this
+copy() this
+setFromEuler() this
+setFromAxisAngle() this
+setFromRotationMatrix() this
+setFromUnitVectors() this
+angleTo() number
+rotateTowards() this
+identity() this
+invert() this
+conjugate() this
+dot() number
+lengthSq() number
+length() number
+normalize() this
+multiply() this
+premultiply() this
+multiplyQuaternions() this
+slerp() this
+slerpQuaternions() this
+equals() boolean
+fromArray() this
+toArray() number[]
+toArray() ArrayLike~number~
+toJSON() [number, number, number, number]
+fromBufferAttribute() this
+_onChange() this
+slerpFlat() void$
+multiplyQuaternionsFlat() number[]$
+random() this
+__computed() Generator~number, void, unknown~
        }
class QuaternionLike {
            <<interface>>
            +x: number
+y: number
+z: number
+w: number
            
        }
class Ray{
            +origin: Vector3
+direction: Vector3
            +set() Ray
+clone() this
+copy() this
+at() Vector3
+lookAt() Ray
+recast() Ray
+closestPointToPoint() Vector3
+distanceToPoint() number
+distanceSqToPoint() number
+distanceSqToSegment() number
+intersectSphere() Vector3
+intersectsSphere() boolean
+distanceToPlane() number
+intersectPlane() Vector3
+intersectsPlane() boolean
+intersectBox() Vector3
+intersectsBox() boolean
+intersectTriangle() Vector3
+applyMatrix4() Ray
+equals() boolean
+isIntersectionBox() any
+isIntersectionPlane() any
+isIntersectionSphere() any
        }
class Sphere{
            +isSphere: true
+center: Vector3
+radius: number
            +set() Sphere
+setFromPoints() Sphere
+clone() this
+copy() this
+expandByPoint() this
+isEmpty() boolean
+makeEmpty() this
+containsPoint() boolean
+distanceToPoint() number
+intersectsSphere() boolean
+intersectsBox() boolean
+intersectsPlane() boolean
+clampPoint() Vector3
+getBoundingBox() Box3
+applyMatrix4() Sphere
+translate() Sphere
+equals() boolean
+union() this
+empty() any
        }
class Spherical{
            +radius: number
+phi: number
+theta: number
            +set() this
+clone() this
+copy() this
+makeSafe() this
+setFromVector3() this
+setFromCartesianCoords() this
        }
class SphericalHarmonics3{
            +coefficients: Vector3[]
+isSphericalHarmonics3: true
            +set() SphericalHarmonics3
+zero() SphericalHarmonics3
+add() SphericalHarmonics3
+addScaledSH() SphericalHarmonics3
+scale() SphericalHarmonics3
+lerp() SphericalHarmonics3
+equals() boolean
+copy() SphericalHarmonics3
+clone() this
+fromArray() this
+toArray() number[]
+toArray() ArrayLike~number~
+getAt() Vector3
+getIrradianceAt() Vector3
+getBasisAt() void$
        }
class Triangle{
            +a: Vector3
+b: Vector3
+c: Vector3
            +set() Triangle
+setFromPointsAndIndices() this
+setFromAttributeAndIndices() this
+clone() this
+copy() this
+getArea() number
+getMidpoint() Vector3
+getNormal() Vector3
+getPlane() Plane
+getBarycoord() Vector3
+getInterpolation() Vector2
+getInterpolation() Vector3
+getInterpolation() Vector4
+containsPoint() boolean
+intersectsBox() boolean
+isFrontFacing() boolean
+closestPointToPoint() Vector3
+equals() boolean
+getNormal() Vector3$
+getBarycoord() Vector3$
+containsPoint() boolean$
+getInterpolation() Vector2$
+getInterpolation() Vector3$
+getInterpolation() Vector4$
+isFrontFacing() boolean$
        }
class Vector2{
            +x: number
+y: number
+width: number
+height: number
+isVector2: true
            +set() this
+setScalar() this
+setX() this
+setY() this
+setComponent() this
+getComponent() number
+clone() this
+copy() this
+add() this
+addScalar() this
+addVectors() this
+addScaledVector() this
+sub() this
+subScalar() this
+subVectors() this
+multiply() this
+multiplyScalar() this
+divide() this
+divideScalar() this
+applyMatrix3() this
+min() this
+max() this
+clamp() this
+clampScalar() this
+clampLength() this
+floor() this
+ceil() this
+round() this
+roundToZero() this
+negate() this
+dot() number
+cross() number
+lengthSq() number
+length() number
+manhattanLength() number
+normalize() this
+angle() number
+angleTo() number
+distanceTo() number
+distanceToSquared() number
+manhattanDistanceTo() number
+setLength() this
+lerp() this
+lerpVectors() this
+equals() boolean
+fromArray() this
+toArray() number[]
+toArray() Vector2Tuple
+toArray() ArrayLike~number~
+fromBufferAttribute() this
+rotateAround() this
+random() this
+__computed() Iterator~number, any, undefined~
        }
class Vector2Like {
            <<interface>>
            +x: number
+y: number
            
        }
class Vector3{
            +x: number
+y: number
+z: number
+isVector3: true
            +set() this
+setScalar() this
+setX() this
+setY() this
+setZ() this
+setComponent() this
+getComponent() number
+clone() this
+copy() this
+add() this
+addScalar() this
+addVectors() this
+addScaledVector() this
+sub() this
+subScalar() this
+subVectors() this
+multiply() this
+multiplyScalar() this
+multiplyVectors() this
+applyEuler() this
+applyAxisAngle() this
+applyMatrix3() this
+applyNormalMatrix() this
+applyMatrix4() this
+applyQuaternion() this
+project() this
+unproject() this
+transformDirection() this
+divide() this
+divideScalar() this
+min() this
+max() this
+clamp() this
+clampScalar() this
+clampLength() this
+floor() this
+ceil() this
+round() this
+roundToZero() this
+negate() this
+dot() number
+lengthSq() number
+length() number
+manhattanLength() number
+normalize() this
+setLength() this
+lerp() this
+lerpVectors() this
+cross() this
+crossVectors() this
+projectOnVector() this
+projectOnPlane() this
+reflect() this
+angleTo() number
+distanceTo() number
+distanceToSquared() number
+manhattanDistanceTo() number
+setFromSpherical() this
+setFromSphericalCoords() this
+setFromCylindrical() this
+setFromCylindricalCoords() this
+setFromMatrixPosition() this
+setFromMatrixScale() this
+setFromMatrixColumn() this
+setFromMatrix3Column() this
+setFromEuler() this
+setFromColor() this
+equals() boolean
+fromArray() this
+toArray() number[]
+toArray() Vector3Tuple
+toArray() ArrayLike~number~
+fromBufferAttribute() this
+random() this
+randomDirection() this
+__computed() Iterator~number, any, undefined~
        }
class Vector3Like {
            <<interface>>
            +x: number
+y: number
+z: number
            
        }
class Vector4{
            +x: number
+y: number
+z: number
+w: number
+width: number
+height: number
+isVector4: true
            +set() this
+setScalar() this
+setX() this
+setY() this
+setZ() this
+setW() this
+setComponent() this
+getComponent() number
+clone() this
+copy() this
+add() this
+addScalar() this
+addVectors() this
+addScaledVector() this
+sub() this
+subScalar() this
+subVectors() this
+multiply() this
+multiplyScalar() this
+applyMatrix4() this
+divideScalar() this
+setAxisAngleFromQuaternion() this
+setAxisAngleFromRotationMatrix() this
+min() this
+max() this
+clamp() this
+clampScalar() this
+floor() this
+ceil() this
+round() this
+roundToZero() this
+negate() this
+dot() number
+lengthSq() number
+length() number
+manhattanLength() number
+normalize() this
+setLength() this
+lerp() this
+lerpVectors() this
+equals() boolean
+fromArray() this
+toArray() number[]
+toArray() Vector4Tuple
+toArray() ArrayLike~number~
+fromBufferAttribute() this
+random() this
+__computed() Iterator~number, any, undefined~
        }
class Vector4Like {
            <<interface>>
            +x: number
+y: number
+z: number
+w: number
            
        }
class BatchedMesh{
            +boundingBox: Box3
+boundingSphere: Sphere
+customSort: (this: this, list: #123; start: number; count: number; z: number; #125;[], camera: Camera) =~ void
+perObjectFrustumCulled: boolean
+sortObjects: boolean
+isBatchedMesh: true
            +computeBoundingBox() void
+computeBoundingSphere() void
+dispose() this
+setCustomSort() this
+getMatrixAt() Matrix4
+getVisibleAt() boolean
+setMatrixAt() this
+setVisibleAt() this
+addGeometry() number
+setGeometryAt() number
+deleteGeometry() this
+getBoundingBoxAt() Box3
+getBoundingSphereAt() Sphere
        }
Mesh~TGeometry,TMaterial,TEventMap~<|--BatchedMesh
class Bone~TEventMap~{
            +isBone: true
+type: string
            
        }
Object3D~TEventMap~<|--Bone~TEventMap~
class Group~TEventMap~{
            +isGroup: true
+type: string
            
        }
Object3D~TEventMap~<|--Group~TEventMap~
class InstancedMesh~TGeometry,TMaterial,TEventMap~{
            +isInstancedMesh: true
+boundingBox: Box3
+boundingSphere: Sphere
+count: number
+instanceColor: InstancedBufferAttribute
+instanceMatrix: InstancedBufferAttribute
+morphTexture: DataTexture
            +computeBoundingBox() void
+computeBoundingSphere() void
+getColorAt() void
+setColorAt() void
+getMatrixAt() void
+getMorphAt() void
+setMatrixAt() void
+setMorphAt() void
+updateMorphTargets() void
+dispose() this
        }
class InstancedMeshEventMap {
            <<interface>>
            +dispose: #123;#125;
            
        }
Mesh~TGeometry,TMaterial,TEventMap~<|--InstancedMesh~TGeometry,TMaterial,TEventMap~
Object3DEventMap<|..InstancedMeshEventMap
class Line~TGeometry,TMaterial,TEventMap~{
            +isLine: true
+type: string
+geometry: TGeometry
+material: TMaterial
+morphTargetInfluences?: number[]
+morphTargetDictionary?: #123; [key: string]: number; #125;
            +computeLineDistances() this
+updateMorphTargets() void
        }
Object3D~TEventMap~<|--Line~TGeometry,TMaterial,TEventMap~
class LineLoop~TGeometry,TMaterial,TEventMap~{
            +isLineLoop: true
+type: string
            
        }
Line~TGeometry,TMaterial,TEventMap~<|--LineLoop~TGeometry,TMaterial,TEventMap~
class LineSegments~TGeometry,TMaterial,TEventMap~{
            +isLineSegments: true
+type: string
            
        }
Line~TGeometry,TMaterial,TEventMap~<|--LineSegments~TGeometry,TMaterial,TEventMap~
class LOD~TEventMap~{
            +isLOD: true
+type: string
+levels: #123; object: Object3D~Object3DEventMap~; distance: number; hysteresis: number; #125;[]
+autoUpdate: boolean
            +addLevel() this
+getCurrentLevel() number
+getObjectForDistance() Object3D~Object3DEventMap~
+update() void
        }
Object3D~TEventMap~<|--LOD~TEventMap~
class Mesh~TGeometry,TMaterial,TEventMap~{
            +isMesh: true
+type: string
+geometry: TGeometry
+material: TMaterial
+morphTargetInfluences?: number[]
+morphTargetDictionary?: #123; [key: string]: number; #125;
            +updateMorphTargets() void
+getVertexPosition() Vector3
        }
Object3D~TEventMap~<|--Mesh~TGeometry,TMaterial,TEventMap~
class Points~TGeometry,TMaterial,TEventMap~{
            +isPoints: true
+type: string
+morphTargetInfluences?: number[]
+morphTargetDictionary?: #123; [key: string]: number; #125;
+geometry: TGeometry
+material: TMaterial
            +updateMorphTargets() void
        }
Object3D~TEventMap~<|--Points~TGeometry,TMaterial,TEventMap~
class Skeleton{
            +uuid: string
+bones: Bone~Object3DEventMap~[]
+boneInverses: Matrix4[]
+boneMatrices: Float32Array
+boneTexture: DataTexture
+frame: number
            +init() void
+calculateInverses() void
+computeBoneTexture() this
+pose() void
+update() void
+clone() Skeleton
+getBoneByName() Bone~Object3DEventMap~
+dispose() void
+toJSON() unknown
+fromJSON() void
        }
class SkinnedMesh~TGeometry,TMaterial,TEventMap~{
            +isSkinnedMesh: true
+type: string
+bindMode: BindMode
+bindMatrix: Matrix4
+bindMatrixInverse: Matrix4
+boundingBox: Box3
+boundingSphere: Sphere
+skeleton: Skeleton
            +bind() void
+computeBoundingBox() void
+computeBoundingSphere() void
+pose() void
+normalizeSkinWeights() void
+applyBoneTransform() Vector3
        }
Mesh~TGeometry,TMaterial,TEventMap~<|--SkinnedMesh~TGeometry,TMaterial,TEventMap~
class Sprite~TEventMap~{
            +isSprite: true
+type: string
+castShadow: false
+geometry: BufferGeometry~NormalBufferAttributes~
+material: SpriteMaterial
+center: Vector2
            
        }
Object3D~TEventMap~<|--Sprite~TEventMap~
class WebGL3DRenderTarget{
            +textures: Data3DTexture[]
+isWebGL3DRenderTarget: true
            
        }
WebGLRenderTarget~TTexture~<|--WebGL3DRenderTarget
class WebGLArrayRenderTarget{
            +textures: DataArrayTexture[]
+isWebGLArrayRenderTarget: true
            
        }
WebGLRenderTarget~TTexture~<|--WebGLArrayRenderTarget
class WebGLCubeRenderTarget{
            +textures: CubeTexture[]
            +fromEquirectangularTexture() this
+clear() void
        }
WebGLRenderTarget~TTexture~<|--WebGLCubeRenderTarget
class WebGLRenderer{
            +domElement: HTMLCanvasElement
+autoClear: boolean
+autoClearColor: boolean
+autoClearDepth: boolean
+autoClearStencil: boolean
+debug: WebGLDebug
+sortObjects: boolean
+clippingPlanes: Plane[]
+localClippingEnabled: boolean
+extensions: WebGLExtensions
+useLegacyLights: boolean
+toneMapping: ToneMapping
+toneMappingExposure: number
+info: WebGLInfo
+shadowMap: WebGLShadowMap
+pixelRatio: number
+capabilities: WebGLCapabilities
+properties: WebGLProperties
+renderLists: WebGLRenderLists
+state: WebGLState
+xr: WebXRManager
+compile: (scene: Object3D~Object3DEventMap~, camera: Camera, targetScene?: Scene) =~ Set~Material~
+compileAsync: (scene: Object3D~Object3DEventMap~, camera: Camera, targetScene?: Scene) =~ Promise~Object3D~Object3DEventMap~~
+vr: boolean
+shadowMapEnabled: boolean
+shadowMapType: ShadowMapType
+shadowMapCullFace: CullFace
            +getContext() WebGLRenderingContext | WebGL2RenderingContext
+getContextAttributes() any
+forceContextLoss() void
+forceContextRestore() void
+getMaxAnisotropy() number
+getPrecision() string
+getPixelRatio() number
+setPixelRatio() void
+getDrawingBufferSize() Vector2
+setDrawingBufferSize() void
+getSize() Vector2
+setSize() void
+getCurrentViewport() Vector4
+getViewport() Vector4
+setViewport() void
+getScissor() Vector4
+setScissor() void
+getScissorTest() boolean
+setScissorTest() void
+setOpaqueSort() void
+setTransparentSort() void
+getClearColor() Color
+setClearColor() void
+getClearAlpha() number
+setClearAlpha() void
+clear() void
+clearColor() void
+clearDepth() void
+clearStencil() void
+clearTarget() void
+resetGLState() void
+dispose() void
+renderBufferDirect() void
+setAnimationLoop() void
+animate() void
+render() void
+getActiveCubeFace() number
+getActiveMipmapLevel() number
+getRenderTarget() WebGLRenderTarget~Texture~
+getCurrentRenderTarget() WebGLRenderTarget~Texture~
+setRenderTarget() void
+readRenderTargetPixels() void
+copyFramebufferToTexture() void
+copyTextureToTexture() void
+copyTextureToTexture3D() void
+initTexture() void
+resetState() void
+supportsFloatTextures() any
+supportsHalfFloatTextures() any
+supportsStandardDerivatives() any
+supportsCompressedTextureS3TC() any
+supportsCompressedTexturePVRTC() any
+supportsBlendMinMax() any
+supportsVertexTextures() any
+supportsInstancedArrays() any
+enableScissorTest() any
        }
class Renderer {
            <<interface>>
            +domElement: HTMLCanvasElement
            +render() void
+setSize() void
        }
class WebGLRendererParameters {
            <<interface>>
            +canvas?: HTMLCanvasElement | OffscreenCanvas
+context?: WebGLRenderingContext
+precision?: string
+alpha?: boolean
+premultipliedAlpha?: boolean
+antialias?: boolean
+stencil?: boolean
+preserveDrawingBuffer?: boolean
+powerPreference?: string
+depth?: boolean
+logarithmicDepthBuffer?: boolean
+failIfMajorPerformanceCaveat?: boolean
            
        }
class WebGLDebug {
            <<interface>>
            +checkShaderErrors: boolean
+onShaderError: (gl: WebGLRenderingContext, program: WebGLProgram, glVertexShader: WebGLShader, glFragmentShader: WebGLShader) =~ void
            
        }
Renderer<|..WebGLRenderer
class WebGLRenderTarget~TTexture~{
            +isWebGLRenderTarget: true
            
        }
RenderTarget~TTexture~<|--WebGLRenderTarget~TTexture~
class Fog{
            +isFog: true
+name: string
+color: Color
+near: number
+far: number
            +clone() Fog
+toJSON() any
        }
class FogBase {
            <<interface>>
            +name: string
+color: Color
            +clone() FogBase
+toJSON() any
        }
FogBase<|..Fog
class FogExp2{
            +isFogExp2: true
+name: string
+color: Color
+density: number
            +clone() FogExp2
+toJSON() any
        }
FogBase<|..FogExp2
class Scene{
            +isScene: true
+type: "Scene"
+fog: FogBase
+backgroundBlurriness: number
+backgroundIntensity: number
+overrideMaterial: Material
+background: Texture | Color | CubeTexture
+backgroundRotation: Euler
+environment: Texture
+environmentIntensity: number
+environmentRotation: Euler
            +toJSON() any
        }
Object3D~TEventMap~<|--Scene
class CanvasTexture{
            +isCanvasTexture: true
            
        }
Texture<|--CanvasTexture
class CompressedArrayTexture{
            +isCompressedArrayTexture: true
+wrapR: Wrapping
            
        }
CompressedTexture<|--CompressedArrayTexture
class CompressedCubeTexture{
            +isCompressedCubeTexture: true
+isCubeTexture: true
            
        }
CompressedTexture<|--CompressedCubeTexture
class CompressedTexture{
            +isCompressedTexture: true
+mipmaps: ImageData[]
+format: CompressedPixelFormat
+flipY: boolean
+generateMipmaps: boolean
            
        }
Texture<|--CompressedTexture
class CubeTexture{
            +isCubeTexture: true
+mapping: CubeTextureMapping
+flipY: boolean
            
        }
Texture<|--CubeTexture
class Data3DTexture{
            +isData3DTexture: true
+magFilter: MagnificationTextureFilter
+minFilter: MinificationTextureFilter
+wrapR: Wrapping
+flipY: boolean
+generateMipmaps: boolean
+unpackAlignment: number
            
        }
Texture<|--Data3DTexture
class DataArrayTexture{
            +isDataArrayTexture: true
+magFilter: MagnificationTextureFilter
+minFilter: MinificationTextureFilter
+wrapR: boolean
+flipY: boolean
+generateMipmaps: boolean
+unpackAlignment: number
            
        }
Texture<|--DataArrayTexture
class DataTexture{
            +isDataTexture: true
+magFilter: MagnificationTextureFilter
+minFilter: MinificationTextureFilter
+flipY: boolean
+generateMipmaps: boolean
+unpackAlignment: number
            
        }
Texture<|--DataTexture
class DepthTexture{
            +isDepthTexture: true
+flipY: boolean
+magFilter: MagnificationTextureFilter
+minFilter: MinificationTextureFilter
+generateMipmaps: boolean
+format: DepthTexturePixelFormat
+type: TextureDataType
+compareFunction: TextureComparisonFunction
            
        }
Texture<|--DepthTexture
class FramebufferTexture{
            +isFramebufferTexture: true
+magFilter: MagnificationTextureFilter
+minFilter: MinificationTextureFilter
+generateMipmaps: boolean
            
        }
Texture<|--FramebufferTexture
class Source{
            +isSource: true
+id: number
+data: any
+dataReady: boolean
+uuid: string
+version: number
            +toJSON() #123;#125;
        }
class Texture{
            +isTexture: true
+id: number
+uuid: string
+name: string
+source: Source
+mipmaps: any[]
+mapping: AnyMapping
+channel: number
+wrapS: Wrapping
+wrapT: Wrapping
+magFilter: MagnificationTextureFilter
+minFilter: MinificationTextureFilter
+anisotropy: number
+format: AnyPixelFormat
+type: TextureDataType
+internalFormat: PixelFormatGPU
+matrix: Matrix3
+matrixAutoUpdate: boolean
+offset: Vector2
+repeat: Vector2
+center: Vector2
+rotation: number
+generateMipmaps: boolean
+premultiplyAlpha: boolean
+flipY: boolean
+unpackAlignment: number
+colorSpace: ColorSpace
+isRenderTargetTexture: boolean
+userData: Record~string, any~
+version: number
+pmremVersion: number
+DEFAULT_ANISOTROPY: number$
+DEFAULT_IMAGE: any$
+DEFAULT_MAPPING: Mapping$
+onUpdate: () =~ void
            +transformUv() Vector2
+updateMatrix() void
+clone() this
+copy() this
+toJSON() #123;#125;
+dispose() void
        }
class OffscreenCanvas {
            <<interface>>
            
            
        }
EventDispatcher~TEventMap~<|--Texture
EventTarget<|..OffscreenCanvas
EventTarget<|..OffscreenCanvas
class TextureImageData {
            <<interface>>
            +data: Uint8ClampedArray
+height: number
+width: number
            
        }
class Texture3DImageData {
            <<interface>>
            +depth: number
            
        }
TextureImageData<|..Texture3DImageData
class VideoTexture{
            +isVideoTexture: true
+magFilter: MagnificationTextureFilter
+minFilter: MinificationTextureFilter
+generateMipmaps: boolean
            +update() void
        }
Texture<|--VideoTexture
class AxisAngle{
            +angle: number
            +fromQuaternion() AxisAngle$
+toRotationMatrix() Matrix4
+clone() this
        }
Vector3<|--AxisAngle
class Euler{
            +x: number
+y: number
+z: number
            +fromQuaternion() Euler$
+fromRotationMatrix() Euler$
+toVector() Vector3
+toVector3() Vector3
+toRotationMatrix() Matrix4
+clone() this
        }
Euler<|--Euler
class Matrix3{
            +elements: number[]
            +fromArray() T$
+clone() this
        }
Matrix3<|--Matrix3
class Matrix4{
            +elements: number[]
            +round() Matrix4$
+fromArray() T$
+rotationFromQuaternion() T$
+rotationFromEuler() T$
+rotationFromAxisAngle() T$
+clone() this
        }
Matrix4<|--Matrix4
class Quaternion{
            +x: number
+y: number
+z: number
+w: number
            +fromThreeJS() InstanceType~T~$
+fromEuler() InstanceType~T~$
+fromAxisAngle() InstanceType~T~$
+fromRotationMatrix() InstanceType~T~$
+toEuler() Euler
+toAxisAngle() AxisAngle
+toRotationMatrix() Matrix4
+clone() this
        }
Quaternion<|--Quaternion
class Vector2{
            +x: number
+y: number
            +fromArray() Vector2$
+clone() this
        }
Vector2<|--Vector2
class Vector3{
            +x: number
+y: number
+z: number
            +fromArray() T$
+fromVector() T$
+clone() this
        }
Vector3<|--Vector3
class Vector4{
            +x: number
+y: number
+z: number
+w: number
            +fromArray() Vector4$
+clone() this
        }
Vector4<|--Vector4
class AccelerationUnit{
            +METER_PER_SECOND_SQUARE: DerivedUnit$
+GRAVITATIONAL_FORCE: AccelerationUnit$
            
        }
DerivedUnit<|--AccelerationUnit
class AngleUnit{
            +RADIAN: AngleUnit$
+DEGREE: AngleUnit$
            
        }
Unit<|--AngleUnit
class AngularVelocityUnit{
            +RADIAN_PER_SECOND: DerivedUnit$
+DEGREE_PER_SECOND: DerivedUnit$
+RADIAN_PER_MINUTE: DerivedUnit$
+DEGREE_PER_MINUTE: DerivedUnit$
            
        }
DerivedUnit<|--AngularVelocityUnit
class DerivedUnit{
            -_units: Map~string, Unit~
-_unitPower: Map~string, number~
            +addUnit() DerivedUnit
+swap() DerivedUnit
        }
Unit<|--DerivedUnit
class GCS{
            +EARTH_RADIUS_MEAN: 6371008.7714$
+EARTH_EQUATORIAL_RADIUS: 6378137$
+EARTH_POLAR_RADIUS: 6356752.3142$
+EARTH_ECCENTRICITY: 0.081819190842622$
+EPSG4326: GCS$
+WGS84: GCS$
+ECEF: GCS$
+EPSG3857: GCS$
            
        }
Unit<|--GCS
class LengthUnit{
            +METER: LengthUnit$
+CENTIMETER: LengthUnit$
+MILLIMETER: LengthUnit$
+KILOMETER: LengthUnit$
+MILE: LengthUnit$
            
        }
Unit<|--LengthUnit
class LinearVelocityUnit{
            +METER_PER_SECOND: DerivedUnit$
+CENTIMETER_PER_SECOND: DerivedUnit$
            
        }
DerivedUnit<|--LinearVelocityUnit
class LuminanceIntensityUnit{
            +CANDELA: LuminanceIntensityUnit$
            
        }
Unit<|--LuminanceIntensityUnit
class LuminanceUnit{
            +LUMEN: LuminanceUnit$
            
        }
Unit<|--LuminanceUnit
class MagnetismUnit{
            +TESLA: MagnetismUnit$
+MICROTESLA: MagnetismUnit$
            
        }
Unit<|--MagnetismUnit
class PressureUnit{
            +PASCAL: PressureUnit$
            
        }
Unit<|--PressureUnit
class TemperatureUnit{
            +CELCIUS: TemperatureUnit$
+FAHRENHEIT: TemperatureUnit$
+KELVIN: TemperatureUnit$
+RANKINE: TemperatureUnit$
            
        }
Unit<|--TemperatureUnit
class TimeUnit{
            +SECOND: TimeUnit$
+MILLISECOND: TimeUnit$
+MICROSECOND: TimeUnit$
+NANOSECOND: TimeUnit$
+MINUTE: TimeUnit$
+HOUR: TimeUnit$
            
        }
Unit<|--TimeUnit
class Unit{
            -_name: string
-_baseName: string
-_definitions: Map~string, UnitFunctionDefinition~any, any~~
-_prefixType: UnitPrefixType
-_aliases: string[]
#UNIT_BASES: Map~string, string~$
#UNITS: Map~string, Unit~$
+UNKNOWN: Unit$
            +fromJSON() T$
-_initDefinition() void
-_initFunctionDefinition() void
-_initBasicDefinition() void
+createBaseDefinition() UnitFunctionDefinition~any, any~
+createDefinition() UnitFunctionDefinition~any, any~
+specifier() this
#findByName() Unit
+findByName() Unit$
+convert() T
+convert() T$
+registerUnit() Unit$
        }
class UnitBasicDefinition {
            <<type>>
            +unit: string
+magnitude?: number
+offset?: number
            
        }
class UnitFunctionDefinition~In,Out~ {
            <<type>>
            +inputType?: new (...args: any[]) =~ UnitValueType
+outputType?: new (...args: any[]) =~ UnitValueType
+unit: string
+toUnit: (x: In) =~ Out
+fromUnit: (x: Out) =~ In
            
        }
class UnitOptions {
            <<interface>>
            +baseName: string
+name?: string
+definitions?: UnitDefinition[]
+aliases?: string[]
+prefixes?: UnitPrefixType
+override?: boolean
            
        }
class UnitPrefix{
            +DECA: UnitPrefix$
+HECTO: UnitPrefix$
+KILO: UnitPrefix$
+MEGA: UnitPrefix$
+GIGA: UnitPrefix$
+TERA: UnitPrefix$
+PETA: UnitPrefix$
+EXA: UnitPrefix$
+ZETTA: UnitPrefix$
+YOTTA: UnitPrefix$
+DECI: UnitPrefix$
+CENTI: UnitPrefix$
+MILLI: UnitPrefix$
+MICRO: UnitPrefix$
+NANO: UnitPrefix$
+PICO: UnitPrefix$
+FEMTO: UnitPrefix$
+ATTO: UnitPrefix$
+ZEPTO: UnitPrefix$
+YOCTO: UnitPrefix$
+DECIMAL: UnitPrefix[]$
+name: string
+abbrevation: string
+magnitude: number
            
        }
class UnitValue~U,T~{
            #_value: T
#_unit: U
            +to() this
+toString() string
+valueOf() T
+setValue() this
+clone() this
        }
class AbsoluteOrientationSensor{
            
            
        }
SensorObject~T~<|--AbsoluteOrientationSensor
class Accelerometer{
            
            
        }
SensorObject~T~<|--Accelerometer
class GravitySensor{
            
            
        }
SensorObject~T~<|--GravitySensor
class Gyroscope{
            
            
        }
SensorObject~T~<|--Gyroscope
class LinearAccelerationSensor{
            
            
        }
SensorObject~T~<|--LinearAccelerationSensor
class LinearVelocitySensor{
            
            
        }
SensorObject~T~<|--LinearVelocitySensor
class Magnetometer{
            
            
        }
SensorObject~T~<|--Magnetometer
class RelativeOrientationSensor{
            
            
        }
SensorObject~T~<|--RelativeOrientationSensor
class ReferenceSpace{
            -_translationMatrix: Matrix4
-_transformationMatrix: Matrix4
-_scaleMatrix: Matrix4
-_rotation: Quaternion
-_unit: LengthUnit
-_parent: TransformationSpace
            +fromDataObject() ReferenceSpace$
+update() Promise~void~
+orthographic() ReferenceSpace
+perspective() ReferenceSpace
+reset() ReferenceSpace
+referenceUnit() ReferenceSpace
+translation() ReferenceSpace
+scale() ReferenceSpace
+rotation() ReferenceSpace
+transform() Out
        }
DataObject<|--ReferenceSpace
TransformationSpace<|..ReferenceSpace
class TransformationSpace {
            <<interface>>
            +uid: string
+parent: TransformationSpace
            +update() Promise~void~
+transform() Out
        }
class SpaceTransformationOptions {
            <<interface>>
            +inverse?: boolean
            
        }
class GraphShape~In,Out~{
            -_nodes: Map~string, GraphNode~any, any~~
-_edges: Map~string, Edge~any~~
+internalSource: GraphNode~any, In~
+internalSink: GraphNode~Out, any~
+logger: (level: string, message: string, data?: any) =~ void
            -_onDestroy() void
-_onBuild() Promise~void~
+findNodeByUID() GraphNode~any, any~
+findNodeByName() GraphNode~any, any~
+addNode() void
+addEdge() void
+deleteEdge() void
+deleteNode() void
+findEdge() Edge~any~
+pull() Promise~void~
+push() Promise~void~
#onError() void
#onCompleted() void
        }
Node~In,Out~<|--GraphShape~In,Out~
Graph~In,Out~<|..GraphShape~In,Out~
class GraphValidator{
            
            +validate() void$
-_validateInternalNode() void$
+validateNodes() void$
+validateEdges() void$
        }
class ModelGraph~In,Out~{
            -_services: Map~string, Service~
-_dataServices: Map~string, DataService~any, any~~
+referenceSpace: ReferenceSpace
            -_onModelBuild() Promise~void~
-_buildServices() Promise~void~
-_buildNodes() Promise~void~
-_onModelDestroy() Promise~void~
+findService() S
+findDataService() F
-_findDataServiceByUID() F
+findAllServices() S[]
+findAllDataServices() S[]
-_instanceofPriority() [boolean, number]
+addService() void
+push() Promise~void~
+destroy() Promise~boolean~
        }
GraphShape~In,Out~<|--ModelGraph~In,Out~
Model~In,Out~<|..ModelGraph~In,Out~
class EMAFilterNode~InOut~{
            
            +initFilter() Promise~any~
+filter() Promise~T~
        }
class EMAFilterOptions {
            <<interface>>
            +alpha: number
            
        }
PropertyFilterProcessingNode~InOut~<|--EMAFilterNode~InOut~
FilterProcessingOptions<|..EMAFilterOptions
class FilterProcessingNode~InOut~{
            #options: FilterProcessingOptions
            +processObject() Promise~DataObject~
+initFilter() Promise~any~*
+filter() Promise~DataObject~*
        }
class FilterProcessingOptions {
            <<interface>>
            +expire?: number
            
        }
ObjectProcessingNode~InOut~<|--FilterProcessingNode~InOut~
ObjectProcessingNodeOptions<|..FilterProcessingOptions
class HPFilterNode~InOut~{
            
            +initFilter() Promise~#123; x: T; y: T; alpha: number; #125;~
+filter() Promise~T~
        }
class HPFilterOptions {
            <<interface>>
            +sampleRate: number
+cutOff: number
            
        }
PropertyFilterProcessingNode~InOut~<|--HPFilterNode~InOut~
FilterProcessingOptions<|..HPFilterOptions
class KalmanFilterNode~InOut~{
            
            +initFilter() Promise~any~
+filter() Promise~T~
        }
class KalmanFilter~T~{
            -_R: T
-_Q: T
-_A: T
-_B: T
-_C: T
-_x: T
-_cov: T
            +filter() Vector3
+predict() Vector3
+uncertainty() T
        }
class KalmanFilterOptions {
            <<interface>>
            +R: number | Vector3
+Q: number | Vector3
+A: number | Vector3
+B: number | Vector3
+C: number | Vector3
            
        }
PropertyFilterProcessingNode~InOut~<|--KalmanFilterNode~InOut~
FilterProcessingOptions<|..KalmanFilterOptions
class LPFilterNode~InOut~{
            
            +initFilter() Promise~any~
+filter() Promise~T~
        }
class LPFilterOptions {
            <<interface>>
            +sampleRate: number
+cutOff: number
+alpha?: number
            
        }
PropertyFilterProcessingNode~InOut~<|--LPFilterNode~InOut~
FilterProcessingOptions<|..LPFilterOptions
class PropertyFilterProcessingNode~InOut~{
            -_propertySelector: PropertySelector~InOut~
-_propertyModifier: PropertyModifier~InOut~
#options: FilterProcessingOptions
            +processObject() Promise~DataObject~
#filterValue() Promise~T~
+initFilter() Promise~any~*
+filter() Promise~T~*
        }
class PropertyType {
            <<type>>
            +key: string
+value: number | Vector3
            
        }
ObjectProcessingNode~InOut~<|--PropertyFilterProcessingNode~InOut~
class RelativePositionFilter~InOut,R~{
            #options: RelativePositionFilterOptions
-_relativePositionType: new () =~ R
            +processObject() Promise~DataObject~
        }
class RelativePositionFilterOptions {
            <<interface>>
            +minValue?: number
+maxValue?: number
+maxTimeDifference?: number
            
        }
KalmanFilterNode~InOut~<|--RelativePositionFilter~InOut,R~
KalmanFilterOptions<|..RelativePositionFilterOptions
class SMAFilterNode~InOut~{
            
            +initFilter() Promise~any~
+filter() Promise~T~
        }
class SMAFilterOptions {
            <<interface>>
            +minTaps?: number
+taps: number
            
        }
PropertyFilterProcessingNode~InOut~<|--SMAFilterNode~InOut~
FilterProcessingOptions<|..SMAFilterOptions
class BooleanKeyframeTrack{
            +ValueTypeName: string
            
        }
KeyframeTrack<|--BooleanKeyframeTrack
class ColorKeyframeTrack{
            +ValueTypeName: string
            
        }
KeyframeTrack<|--ColorKeyframeTrack
class NumberKeyframeTrack{
            +ValueTypeName: string
            
        }
KeyframeTrack<|--NumberKeyframeTrack
class QuaternionKeyframeTrack{
            +ValueTypeName: string
            
        }
KeyframeTrack<|--QuaternionKeyframeTrack
class StringKeyframeTrack{
            +ValueTypeName: string
            
        }
KeyframeTrack<|--StringKeyframeTrack
class VectorKeyframeTrack{
            +ValueTypeName: string
            
        }
KeyframeTrack<|--VectorKeyframeTrack
class Curve~TVector~{
            +type: string
+arcLengthDivisions: number
            +getPoint() TVector
+getPointAt() TVector
+getPoints() TVector[]
+getSpacedPoints() TVector[]
+getLength() number
+getLengths() number[]
+updateArcLengths() void
+getUtoTmapping() number
+getTangent() TVector
+getTangentAt() TVector
+computeFrenetFrames() #123; tangents: Vector3[]; normals: Vector3[]; binormals: Vector3[]; #125;
+clone() this
+copy() this
+toJSON() #123;#125;
+fromJSON() this
        }
class CurvePath~TVector~{
            +type: string
+curves: Curve~TVector~[]
+autoClose: boolean
            +add() void
+closePath() this
+getPoint() TVector
+getCurveLengths() number[]
+getPoints() TVector[]
+getSpacedPoints() TVector[]
        }
Curve~TVector~<|--CurvePath~TVector~
class Path{
            +type: string
+currentPoint: Vector2
            +absarc() this
+absellipse() this
+arc() this
+bezierCurveTo() this
+ellipse() this
+lineTo() this
+moveTo() this
+quadraticCurveTo() this
+setFromPoints() this
+splineThru() this
        }
CurvePath~TVector~<|--Path
class Shape{
            +type: string
+uuid: string
+holes: Path[]
            +extractPoints() #123; shape: Vector2[]; holes: Vector2[][]; #125;
+getPointsHoles() Vector2[][]
        }
Path<|--Shape
class ShapePath{
            +type: "ShapePath"
+subPaths: Path[]
+currentPath: Path
+color: Color
            +moveTo() this
+lineTo() this
+quadraticCurveTo() this
+bezierCurveTo() this
+splineThru() this
+toShapes() Shape[]
        }
class ArcCurve{
            +isArcCurve: true
+type: string
            
        }
EllipseCurve<|--ArcCurve
class CatmullRomCurve3{
            +isCatmullRomCurve3: true
+type: string
+closed: boolean
+points: Vector3[]
+curveType: CurveType
+tension: number
            
        }
Curve~TVector~<|--CatmullRomCurve3
class CubicBezierCurve{
            +isCubicBezierCurve: true
+type: string
+v0: Vector2
+v1: Vector2
+v2: Vector2
+v3: Vector2
            
        }
Curve~TVector~<|--CubicBezierCurve
class CubicBezierCurve3{
            +isCubicBezierCurve3: true
+type: string
+v0: Vector3
+v1: Vector3
+v2: Vector3
+v3: Vector3
            
        }
Curve~TVector~<|--CubicBezierCurve3
class EllipseCurve{
            +isEllipseCurve: true
+type: string
+aX: number
+aY: number
+xRadius: number
+yRadius: number
+aStartAngle: number
+aEndAngle: number
+aClockwise: boolean
+aRotation: number
            
        }
Curve~TVector~<|--EllipseCurve
class LineCurve{
            +isLineCurve: true
+type: string
+v1: Vector2
+v2: Vector2
            
        }
Curve~TVector~<|--LineCurve
class LineCurve3{
            +isLineCurve3: true
+type: string
+v1: Vector3
+v2: Vector3
            
        }
Curve~TVector~<|--LineCurve3
class QuadraticBezierCurve{
            +isQuadraticBezierCurve: true
+type: string
+v0: Vector2
+v1: Vector2
+v2: Vector2
            
        }
Curve~TVector~<|--QuadraticBezierCurve
class QuadraticBezierCurve3{
            +isQuadraticBezierCurve3: true
+type: string
+v0: Vector3
+v1: Vector3
+v2: Vector3
            
        }
Curve~TVector~<|--QuadraticBezierCurve3
class SplineCurve{
            +isSplineCurve: true
+type: string
+points: Vector2[]
            
        }
Curve~TVector~<|--SplineCurve
class CubicInterpolant{
            
            +interpolate_() any
        }
Interpolant<|--CubicInterpolant
class DiscreteInterpolant{
            
            +interpolate_() any
        }
Interpolant<|--DiscreteInterpolant
class LinearInterpolant{
            
            +interpolate_() any
        }
Interpolant<|--LinearInterpolant
class QuaternionLinearInterpolant{
            
            +interpolate_() any
        }
Interpolant<|--QuaternionLinearInterpolant
class ShaderLibShader {
            <<interface>>
            +uniforms: #123; [uniform: string]: IUniform~any~; #125;
+vertexShader: string
+fragmentShader: string
            
        }
class IUniform~TValue~ {
            <<interface>>
            +value: TValue
            
        }
class WebGLAttributes{
            
            +get() #123; buffer: WebGLBuffer; type: number; bytesPerElement: number; version: number; size: number; #125;
+remove() void
+update() void
        }
class WebGLBindingStates{
            
            +setup() void
+reset() void
+resetDefaultState() void
+dispose() void
+releaseStatesOfGeometry() void
+releaseStatesOfProgram() void
+initAttributes() void
+enableAttribute() void
+disableUnusedAttributes() void
        }
class WebGLBufferRenderer{
            +setMode: (value: any) =~ void
+render: (start: any, count: number) =~ void
+renderInstances: (start: any, count: number, primcount: number) =~ void
+renderMultiDraw: (starts: Int32Array, counts: Int32Array, drawCount: number) =~ void
            
        }
class WebGLCapabilities{
            +isWebGL2: boolean
+getMaxAnisotropy: () =~ number
+getMaxPrecision: (precision: string) =~ string
+precision: string
+logarithmicDepthBuffer: boolean
+maxTextures: number
+maxVertexTextures: number
+maxTextureSize: number
+maxCubemapSize: number
+maxAttributes: number
+maxVertexUniforms: number
+maxVaryings: number
+maxFragmentUniforms: number
+vertexTextures: boolean
+maxSamples: number
            
        }
class WebGLCapabilitiesParameters {
            <<interface>>
            +precision?: string
+logarithmicDepthBuffer?: boolean
            
        }
class WebGLClipping{
            +uniform: #123; value: any; needsUpdate: boolean; #125;
+numPlanes: number
+numIntersection: number
            +init() boolean
+beginShadows() void
+endShadows() void
+setGlobalState() void
+setState() void
        }
class WebGLCubeMaps{
            
            +get() any
+dispose() void
        }
class WebGLCubeUVMaps{
            
            +get() T extends Texture ? Texture : T
+dispose() void
        }
class WebGLExtensions{
            
            +has() boolean
+init() void
+get() any
        }
class WebGLGeometries{
            
            +get() BufferGeometry~NormalBufferAttributes~
+update() void
+getWireframeAttribute() BufferAttribute
        }
class WebGLIndexedBufferRenderer{
            +setMode: (value: any) =~ void
+setIndex: (index: any) =~ void
+render: (start: any, count: number) =~ void
+renderInstances: (start: any, count: number, primcount: number) =~ void
+renderMultiDraw: (starts: Int32Array, counts: Int32Array, drawCount: number) =~ void
            
        }
class WebGLInfo{
            +autoReset: boolean
+memory: #123; geometries: number; textures: number; #125;
+programs: WebGLProgram[]
+render: #123; calls: number; frame: number; lines: number; points: number; triangles: number; #125;
            +update() void
+reset() void
        }
class WebGLLights{
            +state: WebGLLightsState
            +get() any
+setup() void
+setupView() void
        }
class WebGLLightsState {
            <<interface>>
            +version: number
+hash: #123; directionalLength: number; pointLength: number; spotLength: number; rectAreaLength: number; hemiLength: number; numDirectionalShadows: number; numPointShadows: number; numSpotShadows: number; numSpotMaps: number; numLightProbes: number; #125;
+ambient: number[]
+probe: any[]
+directional: any[]
+directionalShadow: any[]
+directionalShadowMap: any[]
+directionalShadowMatrix: any[]
+spot: any[]
+spotShadow: any[]
+spotShadowMap: any[]
+spotShadowMatrix: any[]
+rectArea: any[]
+point: any[]
+pointShadow: any[]
+pointShadowMap: any[]
+pointShadowMatrix: any[]
+hemi: any[]
+numSpotLightShadowsWithMaps: number
+numLightProbes: number
            
        }
class WebGLObjects{
            
            +update() any
+dispose() void
        }
class WebGLProgram{
            +name: string
+id: number
+cacheKey: string
+usedTimes: number
+program: any
+vertexShader: WebGLShader
+fragmentShader: WebGLShader
+uniforms: any
+attributes: any
            +getUniforms() WebGLUniforms
+getAttributes() any
+destroy() void
        }
class WebGLPrograms{
            +programs: WebGLProgram[]
            +getParameters() WebGLProgramParameters
+getProgramCacheKey() string
+getUniforms() #123; [uniform: string]: IUniform~any~; #125;
+acquireProgram() WebGLProgram
+releaseProgram() void
        }
class WebGLProgramParameters {
            <<interface>>
            +shaderID: string
+shaderType: string
+shaderName: string
+vertexShader: string
+fragmentShader: string
+defines: #123; [define: string]: string | number | boolean; #125;
+customVertexShaderID: string
+customFragmentShaderID: string
+isRawShaderMaterial: boolean
+glslVersion: GLSLVersion
+precision: "highp" | "mediump" | "lowp"
+batching: boolean
+instancing: boolean
+instancingColor: boolean
+instancingMorph: boolean
+supportsVertexTextures: boolean
+outputColorSpace: ColorSpace
+alphaToCoverage: boolean
+map: boolean
+matcap: boolean
+envMap: boolean
+envMapMode: false | Mapping
+envMapCubeUVHeight: number
+aoMap: boolean
+lightMap: boolean
+bumpMap: boolean
+normalMap: boolean
+displacementMap: boolean
+emissiveMap: boolean
+normalMapObjectSpace: boolean
+normalMapTangentSpace: boolean
+metalnessMap: boolean
+roughnessMap: boolean
+anisotropy: boolean
+anisotropyMap: boolean
+clearcoat: boolean
+clearcoatMap: boolean
+clearcoatNormalMap: boolean
+clearcoatRoughnessMap: boolean
+iridescence: boolean
+iridescenceMap: boolean
+iridescenceThicknessMap: boolean
+sheen: boolean
+sheenColorMap: boolean
+sheenRoughnessMap: boolean
+specularMap: boolean
+specularColorMap: boolean
+specularIntensityMap: boolean
+transmission: boolean
+transmissionMap: boolean
+thicknessMap: boolean
+gradientMap: boolean
+opaque: boolean
+alphaMap: boolean
+alphaTest: boolean
+alphaHash: boolean
+combine: Combine
+mapUv: string | false
+aoMapUv: string | false
+lightMapUv: string | false
+bumpMapUv: string | false
+normalMapUv: string | false
+displacementMapUv: string | false
+emissiveMapUv: string | false
+metalnessMapUv: string | false
+roughnessMapUv: string | false
+anisotropyMapUv: string | false
+clearcoatMapUv: string | false
+clearcoatNormalMapUv: string | false
+clearcoatRoughnessMapUv: string | false
+iridescenceMapUv: string | false
+iridescenceThicknessMapUv: string | false
+sheenColorMapUv: string | false
+sheenRoughnessMapUv: string | false
+specularMapUv: string | false
+specularColorMapUv: string | false
+specularIntensityMapUv: string | false
+transmissionMapUv: string | false
+thicknessMapUv: string | false
+alphaMapUv: string | false
+vertexTangents: boolean
+vertexColors: boolean
+vertexAlphas: boolean
+vertexUv1s: boolean
+vertexUv2s: boolean
+vertexUv3s: boolean
+pointsUvs: boolean
+fog: boolean
+useFog: boolean
+fogExp2: boolean
+flatShading: boolean
+sizeAttenuation: boolean
+logarithmicDepthBuffer: boolean
+skinning: boolean
+morphTargets: boolean
+morphNormals: boolean
+morphColors: boolean
+morphTargetsCount: number
+morphTextureStride: number
+numDirLights: number
+numPointLights: number
+numSpotLights: number
+numSpotLightMaps: number
+numRectAreaLights: number
+numHemiLights: number
+numDirLightShadows: number
+numPointLightShadows: number
+numSpotLightShadows: number
+numSpotLightShadowsWithMaps: number
+numLightProbes: number
+numClippingPlanes: number
+numClipIntersection: number
+dithering: boolean
+shadowMapEnabled: boolean
+shadowMapType: ShadowMapType
+toneMapping: ToneMapping
+useLegacyLights: boolean
+decodeVideoTexture: boolean
+premultipliedAlpha: boolean
+doubleSided: boolean
+flipSided: boolean
+useDepthPacking: boolean
+depthPacking: 0 | DepthPackingStrategies
+index0AttributeName: string
+extensionClipCullDistance: boolean
+extensionMultiDraw: boolean
+rendererExtensionParallelShaderCompile: boolean
+customProgramCacheKey: string
            
        }
class WebGLProgramParametersWithUniforms {
            <<interface>>
            +uniforms: #123; [uniform: string]: IUniform~any~; #125;
            
        }
WebGLProgramParameters<|..WebGLProgramParametersWithUniforms
class WebGLProperties{
            
            +get() any
+remove() void
+update() any
+dispose() void
        }
class WebGLRenderList{
            +opaque: RenderItem[]
+transparent: RenderItem[]
+transmissive: RenderItem[]
            +init() void
+push() void
+unshift() void
+sort() void
+finish() void
        }
class WebGLRenderLists{
            
            +dispose() void
+get() WebGLRenderList
        }
class RenderItem {
            <<interface>>
            +id: number
+object: Object3D~Object3DEventMap~
+geometry: BufferGeometry~NormalBufferAttributes~
+material: Material
+program: WebGLProgram
+groupOrder: number
+renderOrder: number
+z: number
+group: Group~Object3DEventMap~
            
        }
class WebGLShadowMap{
            +enabled: boolean
+autoUpdate: boolean
+needsUpdate: boolean
+type: ShadowMapType
+cullFace: any
            +render() void
        }
class WebGLColorBuffer{
            
            +setMask() void
+setLocked() void
+setClear() void
+reset() void
        }
class WebGLDepthBuffer{
            
            +setTest() void
+setMask() void
+setFunc() void
+setLocked() void
+setClear() void
+reset() void
        }
class WebGLStencilBuffer{
            
            +setTest() void
+setMask() void
+setFunc() void
+setOp() void
+setLocked() void
+setClear() void
+reset() void
        }
class WebGLState{
            +buffers: #123; color: WebGLColorBuffer; depth: WebGLDepthBuffer; stencil: WebGLStencilBuffer; #125;
            +enable() void
+disable() void
+bindFramebuffer() void
+drawBuffers() void
+useProgram() boolean
+setBlending() void
+setMaterial() void
+setFlipSided() void
+setCullFace() void
+setLineWidth() void
+setPolygonOffset() void
+setScissorTest() void
+activeTexture() void
+bindTexture() void
+unbindTexture() void
+compressedTexImage2D() void
+texImage2D() void
+texImage2D() void
+texImage3D() void
+scissor() void
+viewport() void
+reset() void
        }
class WebGLTextures{
            
            +allocateTextureUnit() void
+resetTextureUnits() void
+setTexture2D() void
+setTexture2DArray() void
+setTexture3D() void
+setTextureCube() void
+setupRenderTarget() void
+updateRenderTargetMipmap() void
+updateMultisampleRenderTarget() void
+safeSetTexture2D() void
+safeSetTextureCube() void
        }
class WebGLUniforms{
            
            +setValue() void
+setOptional() void
+upload() void$
+seqWithValue() any[]$
        }
class WebGLUtils{
            
            +convert() number
        }
class XRJointSpace{
            +jointRadius: number
            
        }
class XRHandSpace{
            +joints: Partial~XRHandJoints~
+inputState: XRHandInputState
            
        }
class XRTargetRaySpace{
            +hasLinearVelocity: boolean
+linearVelocity: Vector3
+hasAngularVelocity: boolean
+angularVelocity: Vector3
            
        }
class XRGripSpace{
            +hasLinearVelocity: boolean
+linearVelocity: Vector3
+hasAngularVelocity: boolean
+angularVelocity: Vector3
            
        }
class WebXRController{
            
            +getHandSpace() XRHandSpace
+getTargetRaySpace() XRTargetRaySpace
+getGripSpace() XRGripSpace
+dispatchEvent() this
+connect() this
+disconnect() this
+update() this
        }
class XRHandInputState {
            <<interface>>
            +pinching: boolean
            
        }
class WebXRSpaceEventMap {
            <<interface>>
            +select: #123; data: XRInputSource; #125;
+selectstart: #123; data: XRInputSource; #125;
+selectend: #123; data: XRInputSource; #125;
+squeeze: #123; data: XRInputSource; #125;
+squeezestart: #123; data: XRInputSource; #125;
+squeezeend: #123; data: XRInputSource; #125;
+connected: #123; data: XRInputSource; #125;
+disconnected: #123; data: XRInputSource; #125;
+pinchend: #123; handedness: XRHandedness; target: WebXRController; #125;
+pinchstart: #123; handedness: XRHandedness; target: WebXRController; #125;
+move: #123;#125;
            
        }
Group~TEventMap~<|--XRJointSpace
Group~TEventMap~<|--XRHandSpace
Group~TEventMap~<|--XRTargetRaySpace
Group~TEventMap~<|--XRGripSpace
Object3DEventMap<|..WebXRSpaceEventMap
class WebXRDepthSensing{
            +texture: Texture
+mesh: Mesh~BufferGeometry~NormalBufferAttributes~, Material | Material[], Object3DEventMap~
+depthNear: number
+depthFar: number
            +init() void
+render() void
+reset() void
        }
class XRWebGLDepthInformation {
            <<interface>>
            +texture: WebGLTexture
+depthNear: number
+depthFar: number
            
        }
class WebXRManager{
            +enabled: boolean
+isPresenting: boolean
+cameraAutoUpdate: boolean
            +getController() XRTargetRaySpace
+getControllerGrip() XRGripSpace
+getHand() XRHandSpace
+setFramebufferScaleFactor() void
+setReferenceSpaceType() void
+getReferenceSpace() XRReferenceSpace
+setReferenceSpace() void
+getBaseLayer() XRWebGLLayer | XRProjectionLayer
+getBinding() XRWebGLBinding
+getFrame() XRFrame
+getSession() XRSession
+setSession() Promise~void~
+getCamera() WebXRArrayCamera
+updateCamera() void
+setAnimationLoop() void
+getFoveation() number
+setFoveation() void
+dispose() void
        }
class WebXRManagerEventMap {
            <<interface>>
            +sessionstart: #123;#125;
+sessionend: #123;#125;
+planeadded: #123; data: XRPlane; #125;
+planeremoved: #123; data: XRPlane; #125;
+planechanged: #123; data: XRPlane; #125;
+planesdetected: #123; data: XRPlaneSet; #125;
            
        }
EventDispatcher~TEventMap~<|--WebXRManager
```

## Contributing
Use of OpenHPS, contributions and feedback is highly appreciated. Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## License
Copyright (C) 2019-2025 Maxim Van de Wynckel & Vrije Universiteit Brussel

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
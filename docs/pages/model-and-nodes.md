---
title: Model and nodes
---

# Model and nodes

A positioning system in OpenHPS is a _model_: a directed graph of nodes that
{@link DataFrame}s travel through. The graph is assembled with
{@link ModelBuilder} and, once built, is driven either by pulling from the sink
end or pushing from the source end.

## Building a graph

```typescript
import { ModelBuilder } from '@openhps/core';

const model = await ModelBuilder.create()
    .from(sourceNode) // one or more source nodes
    .via(processingNode) // zero or more processing nodes
    .to(sinkNode) // one or more sink nodes
    .build();
```

`from()` with no argument creates a graph that only accepts pushed frames.
Several sources or sinks may be given to the same call, in which case frames are
merged or fanned out respectively.

## Push and pull

The two directions are independent, and a node may support either or both.

| Direction | Started by          | Meaning                                                 |
| --------- | ------------------- | ------------------------------------------------------- |
| Push      | `model.push(frame)` | A frame is available and should be processed            |
| Pull      | `model.pull()`      | Something wants a frame, ask the sources to produce one |

```typescript
await model.push(new DataFrame(new DataObject('phone')));
await model.pull();
```

`push()` resolves once the frame has reached the sinks. Errors raised anywhere in
the graph propagate back to the caller.

## Node categories

### Source nodes

Produce frames. {@link CallbackSourceNode} builds one from a function,
{@link ListSourceNode} replays a fixed list, and {@link SourceMergeNode}
combines several sources into one stream.

### Processing nodes

Transform frames in flight. {@link ObjectProcessingNode} handles one data object
at a time, while {@link RelativePositionProcessing} collects the relative
positions of an object and computes an absolute position from them —
{@link MultilaterationNode} (from distances) and {@link TriangulationNode} (from
angles) are both built on it.

### Sink nodes

Consume frames. {@link CallbackSinkNode} hands each frame to a function and
{@link LoggingSinkNode} logs it.

### Flow shape nodes

Change the shape of the stream rather than its contents: buffering, throttling,
merging and splitting. These live in `nodes/shapes` and are excluded from the
`lite` build.

## Services

Services are attached to the model rather than to a node, and any node can reach
them. They hold the state that outlives a single frame — stored data objects,
recorded trajectories, calibration data.

```typescript
import { ModelBuilder, DataObjectService, MemoryDataService, DataObject } from '@openhps/core';

const model = await ModelBuilder.create()
    .addService(new DataObjectService(new MemoryDataService(DataObject)))
    .from(sourceNode)
    .to(sinkNode)
    .build();

const service = model.findDataService(DataObject);
```

{@link MemoryDataService} keeps everything in memory. Other packages supply
persistent drivers, for example `@openhps/mongodb` and `@openhps/localstorage`.

## Workers

{@link WorkerNode} runs part of a graph on a worker thread. The code given to it
is serialized and rebuilt inside the worker, so it cannot close over variables
from the surrounding scope — anything it needs must be passed through the node's
options or fetched from a service.

## Shutting down

```typescript
await model.emitAsync('destroy');
```

This releases services and terminates any worker threads. A model that is not
destroyed keeps the process alive.

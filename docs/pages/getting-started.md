---
title: Getting Started
---

# Getting Started

`@openhps/core` is the core component of OpenHPS. It provides the process network
(the _model_), the node types that make it up, and the data objects, positions and
units that flow through it.

## Installation

```bash
npm install @openhps/core --save
```

The package requires Node.js 22 or later when used on the server.

## Importing

The package ships both a CommonJS and an ECMAScript module build, selected
automatically through the `exports` map.

```javascript
// CommonJS
const { ModelBuilder, DataObject } = require('@openhps/core');
```

```typescript
// ECMAScript modules and TypeScript
import { ModelBuilder, DataObject } from '@openhps/core';
```

Three additional entry points are available:

| Specifier                | Contents                                                                          |
| ------------------------ | --------------------------------------------------------------------------------- |
| `@openhps/core`          | The full public API                                                               |
| `@openhps/core/lite`     | Reduced build for embedded systems, without the flow-shape nodes and `WorkerNode` |
| `@openhps/core/worker`   | The worker runner, used as the entry point of a worker thread                     |
| `@openhps/core/internal` | Internal APIs, not covered by semantic versioning                                 |

## In the browser

Prebuilt bundles are published in `dist/web/`:

| File                     | Format                               |
| ------------------------ | ------------------------------------ |
| `openhps-core.js`        | UMD                                  |
| `openhps-core.es.js`     | ES module                            |
| `worker.openhps-core.js` | UMD, for worker threads              |
| `openhps-core-lite.js`   | UMD, lite build for embedded systems |

```html
<script type="module">
    import { ModelBuilder, DataObject } from './openhps-core.es.js';
</script>
```

## A first model

Every model starts `from` a source node, passes `via` zero or more processing
nodes, and ends `to` a sink node.

```typescript
import {
    ModelBuilder,
    CallbackSourceNode,
    CallbackSinkNode,
    DataFrame,
    DataObject,
    Absolute2DPosition,
    LengthUnit,
} from '@openhps/core';

const model = await ModelBuilder.create()
    .from(
        new CallbackSourceNode(() => {
            const object = new DataObject('mobile-device');
            object.setPosition(new Absolute2DPosition(3, 4, LengthUnit.METER));
            return new DataFrame(object);
        }),
    )
    .to(
        new CallbackSinkNode((frame: DataFrame) => {
            const position = frame.source.getPosition() as Absolute2DPosition;
            console.log(frame.source.uid, position.x, position.y, position.unit.name);
        }),
    )
    .build();

await model.pull();
```

`pull()` asks the source for a frame and drives it through to the sink. A source
that produces data on its own instead calls `push()`, which sends a frame in the
same direction without being asked.

Release the model when finished, so that services and worker threads shut down:

```typescript
await model.emitAsync('destroy');
```

## Where to next

- [Model and nodes](./model-and-nodes.md) — how the process network is assembled.
- [Data objects and positioning](./data-and-positioning.md) — what travels through it.
- [Serialization](./serialization.md) — how it is persisted and sent across boundaries.

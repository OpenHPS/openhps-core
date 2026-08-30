---
title: Serialization
---

# Serialization

Everything that travels through a model can be converted to and from plain JSON.
This is what makes it possible to persist data objects, send frames to a remote
model, or hand them to a worker thread.

Serialization is driven by decorators, so a class describes its own mapping.

## Making a class serializable

```typescript
import { DataObject, SerializableObject, SerializableMember } from '@openhps/core';

@SerializableObject()
class Room extends DataObject {
    @SerializableMember()
    floor: number;
}
```

```typescript
import { DataSerializer } from '@openhps/core';

const room = new Room('room-a');
room.floor = 3;

const json = DataSerializer.serialize(room);
// {
//   createdTimestamp: 1788085056090748,
//   uid: 'room-a',
//   relativePositions: [],
//   floor: 3,
//   __type: 'Room'
// }

const restored = DataSerializer.deserialize(json);
restored instanceof Room; // true
```

The `__type` hint is what allows {@link DataSerializer.deserialize} to rebuild
the original subclass rather than a plain object. Because of it, a
{@link DataFrame} holding a mix of `DataObject` subclasses round trips with each
object keeping its own type.

## Members

`@SerializableMember` covers single values. Collections have their own
decorators, because the element type cannot be recovered from reflection alone.

| Decorator                       | For            |
| ------------------------------- | -------------- |
| {@link SerializableMember}      | A single value |
| {@link SerializableArrayMember} | Arrays         |
| {@link SerializableMapMember}   | `Map`s         |
| {@link SerializableSetMember}   | `Set`s         |

```typescript
@SerializableObject()
class Floor extends DataObject {
    @SerializableArrayMember(Room)
    rooms: Room[] = [];

    @SerializableMapMember(String, Room)
    byName: Map<string, Room> = new Map();
}
```

Useful options:

```typescript
@SerializableMember({
    name: 'storedName',   // key used in the JSON
    isRequired: true,     // fail deserialization when absent
    numberType: NumberType.DECIMAL,
})
value: number;
```

> Renaming a member with `name` in a subclass changes only that subclass. The
> super type keeps its own key.

## Numbers

`numberType` controls how a number is stored, which matters for size and for
precision when frames are sent over a network or written to a binary format.

```typescript
import { NumberType } from '@openhps/core';

@SerializableMember({ numberType: NumberType.DECIMAL })
x: number;
```

## Serializing a whole model

{@link ModelSerializer} does for a graph what {@link DataSerializer} does for
data: it converts nodes and their configuration to JSON so a model can be rebuilt
elsewhere — this is how {@link WorkerNode} moves part of a graph onto a thread.

```typescript
import { ModelSerializer } from '@openhps/core';

const json = ModelSerializer.serializeNode(node);
const rebuilt = ModelSerializer.deserializeNode(json);
```

## Metadata

{@link DataSerializerUtils} exposes the mapping itself — which members a class
has, their types and their options. It is what other OpenHPS modules use to
generate storage schemas, for example mapping a data object onto MongoDB
documents or RDF triples.

```typescript
import { DataSerializerUtils } from '@openhps/core';

const metadata = DataSerializerUtils.getMetadata(Room);
metadata.dataMembers.forEach((member, key) => {
    console.log(key, member.name);
});
```

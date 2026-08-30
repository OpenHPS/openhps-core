---
title: Data objects and positioning
---

# Data objects and positioning

## Data frames and data objects

A {@link DataFrame} is one unit of work travelling through the model. It carries
a set of {@link DataObject}s, one of which is the _source_ — the object the frame
is about.

```typescript
import { DataFrame, DataObject } from '@openhps/core';

const phone = new DataObject('phone', 'My Phone');
const frame = new DataFrame(phone);

frame.addObject(new DataObject('beacon-1'));
frame.source; // the phone
frame.getObjects(); // every object in the frame
```

A `DataObject` is identified by its `uid`. The same physical thing keeps the same
uid across frames, which is what lets services accumulate history for it.

## Absolute positions

An absolute position places an object in a known frame of reference.

| Class                        | Use                                       |
| ---------------------------- | ----------------------------------------- |
| {@link Absolute2DPosition}   | Planar `x`, `y`                           |
| {@link Absolute3DPosition}   | `x`, `y`, `z`                             |
| {@link GeographicalPosition} | Latitude, longitude and altitude on WGS84 |

```typescript
import { Absolute2DPosition, GeographicalPosition, LengthUnit } from '@openhps/core';

phone.setPosition(new Absolute2DPosition(3, 4, LengthUnit.METER));
phone.setPosition(new GeographicalPosition(50.8206, 4.3922, 12));
```

Every position carries the unit it was expressed in, so a position created in
centimetres and one created in metres compare correctly.

## Relative positions

A relative position describes an object with respect to another object rather
than in absolute terms. This is what most sensors actually measure.

| Class                                                            | Measurement                                    |
| ---------------------------------------------------------------- | ---------------------------------------------- |
| {@link RelativeDistance}                                         | Distance to a reference object                 |
| {@link RelativeAngle}                                            | Azimuth to a reference object                  |
| {@link RelativeOrientation}                                      | Orientation with respect to a reference object |
| {@link Relative2DPosition} / {@link Relative3DPosition}          | Offset vector to a reference object            |
| {@link RelativeLinearVelocity} / {@link RelativeAngularVelocity} | Velocity with respect to a reference object    |

```typescript
import { RelativeDistance, LengthUnit } from '@openhps/core';

phone.addRelativePosition(new RelativeDistance(beacon, 5, LengthUnit.METER));
phone.getRelativePositions();
```

Positioning nodes turn these into an absolute position.
{@link MultilaterationNode} does so from three or more distances,
{@link TriangulationNode} from three angles.

> A `RelativeAngle` holds a single azimuth. Azimuths constrain an object to a
> vertical plane, so no number of them determines altitude; angle-based
> triangulation is inherently planar.

## Units

Units are values, not strings, and convert between each other explicitly.

```typescript
import { LengthUnit, AngleUnit, TimeUnit } from '@openhps/core';

LengthUnit.CENTIMETER.convert(250, LengthUnit.METER); // 2.5
AngleUnit.DEGREE.convert(180, AngleUnit.RADIAN); // Math.PI
TimeUnit.SECOND.convert(1, TimeUnit.MILLISECOND); // 1000
```

Derived units are provided as their own classes rather than composed on the fly:
{@link LinearVelocityUnit}, {@link AngularVelocityUnit}, {@link AccelerationUnit},
{@link MagnetismUnit}, {@link TemperatureUnit}, {@link PressureUnit},
{@link LuminanceUnit} and {@link LuminanceIntensityUnit}.

```typescript
import { LinearVelocityUnit, AngularVelocityUnit } from '@openhps/core';

LinearVelocityUnit.CENTIMETER_PER_SECOND.convert(250, LinearVelocityUnit.METER_PER_SECOND);
AngularVelocityUnit.DEGREE_PER_SECOND.convert(90, AngularVelocityUnit.RADIAN_PER_SECOND);
```

An SI prefix can be applied to any unit with `specifier()`:

```typescript
import { LengthUnit, UnitPrefix } from '@openhps/core';

const nanometer = LengthUnit.METER.specifier(UnitPrefix.NANO);
```

## Reference spaces

A {@link ReferenceSpace} is a transform — translation, rotation and scale —
between two coordinate systems. It lets a model work in whichever space is
convenient and convert at the boundary.

```typescript
import { ReferenceSpace, Euler, AngleUnit } from '@openhps/core';

const screenSpace = new ReferenceSpace().translation(0, 200).rotation(new Euler(180, 0, 0, 'ZXY', AngleUnit.DEGREE));

ModelBuilder.create().from(sourceNode).convertFromSpace(screenSpace).to(sinkNode);
```

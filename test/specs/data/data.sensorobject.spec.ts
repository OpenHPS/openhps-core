import { expect } from 'chai';
import 'mocha';
import { Orientation, SensorValue, SensorObject, DataSerializer, AngularVelocityUnit } from '../../../src';
import { AccelerometerObject } from "../../mock/data/object/AccelerometerObject";
import { GyroscopeObject } from "../../mock/data/object/GyroscopeObject";

describe('SensorObject', () => {
    describe('serialization', () => {
        it('should serialize with a non-standard value', () => {
            const sensor: AccelerometerObject = new AccelerometerObject();
            sensor.value.x = 50;
            sensor.value.y = 20;
            sensor.value.z = 30;
            const serialized = DataSerializer.serialize(sensor);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(sensor);
        });

        it('should serialize with a sensor value', () => {
            const sensor: GyroscopeObject = new GyroscopeObject();
            sensor.value.x = 50;
            sensor.value.y = 20;
            sensor.value.z = 30;
            sensor.value.unit = AngularVelocityUnit.DEGREE_PER_MINUTE;
            const serialized = DataSerializer.serialize(sensor);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(sensor);
        });
    });
});

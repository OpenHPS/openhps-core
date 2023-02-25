import { expect } from 'chai';
import 'mocha';
import { Orientation, SensorValue, SensorObject, DataSerializer, AngularVelocityUnit, Magnetometer, Magnetism, Gyroscope } from '../../../src';
import { AccelerometerObject } from "../../mock/data/object/AccelerometerObject";

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
            const sensor: Gyroscope = new Gyroscope();
            sensor.value.x = 50;
            sensor.value.y = 20;
            sensor.value.z = 30;
            sensor.value.unit = AngularVelocityUnit.DEGREE_PER_MINUTE;
            const serialized = DataSerializer.serialize(sensor);
            const deserialized = DataSerializer.deserialize(serialized) as Gyroscope;
            expect(deserialized).to.eql(sensor);
            expect(deserialized.value.x).to.equal(50);
        });
    });

    describe('initialization', () => {
        it('should initialize with value', () => {
            const magnetometer = new Magnetometer("M1", new Magnetism(
                1,
                2,
                3
            ), 50);
            expect(magnetometer.value.x).to.equal(1);
        });

        it('should initialize with a default value', () => {
            const magnetometer = new Magnetometer("M1");
            magnetometer.value.x = 1;
            expect(magnetometer.value.x).to.equal(1);
            expect(magnetometer.value).to.be.instanceOf(Magnetism);
        });
    });
});

import { expect } from 'chai';
import 'mocha';
import { Accuracy1D, DataSerializer, Orientation, SerializableMember, SerializableObject } from '../../../src';

describe('Orientation', () => {
    it('should be serializable', () => {
        const orientation = Orientation.fromEuler({
            yaw: 0, pitch: 0, roll: 0
        });
        expect(orientation).to.be.instanceof(Orientation);
        const serialized = DataSerializer.serialize(orientation);
        expect(serialized.__type).to.eq("Orientation");
        const deserialized = DataSerializer.deserialize(serialized);
        expect(deserialized).to.be.instanceof(Orientation);
    });

    it('should be serializable within a class', () => {
        @SerializableObject()
        class Test {
            @SerializableMember()
            orientation: Orientation;
        }
        const obj = new Test();
        obj.orientation = Orientation.fromEuler({
            yaw: 0, pitch: 0, roll: 0
        });
        obj.orientation.accuracy = new Accuracy1D(1);
        const serialized = DataSerializer.serialize(obj);
        const deserialized: Test = DataSerializer.deserialize(serialized);
        expect(deserialized.orientation).to.be.instanceof(Orientation);
    });
});

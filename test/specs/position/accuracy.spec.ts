import { expect } from 'chai';
import 'mocha';
import {
    Accuracy,
    Accuracy2D,
    Accuracy3D,
    DataSerializer,
    LengthUnit,
    SerializableMember,
    SerializableObject,
} from '../../../src';

describe('Accuracy', () => {
    describe('Accuracy2D', () => {
        it('should be directly serializable', () => {
            const accuracy = new Accuracy2D(3, 2, LengthUnit.METER);
            const serialized = DataSerializer.serialize(accuracy);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(accuracy);
        });

        it('should be indirectly serializable', () => {
            @SerializableObject()
            class ExampleObject {
                @SerializableMember()
                accuracy: Accuracy<any, any>;
            }
            const obj = new ExampleObject();
            obj.accuracy = new Accuracy2D(3, 2, LengthUnit.METER);
            const serialized = DataSerializer.serialize(obj);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(obj);
        });
    });

    describe('Accuracy3D', () => {
        it('should be directly serializable', () => {
            const accuracy = new Accuracy3D(3, 2, 5, LengthUnit.METER);
            const serialized = DataSerializer.serialize(accuracy);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized).to.eql(accuracy);
        });
    });
});

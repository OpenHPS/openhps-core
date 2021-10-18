import { expect } from 'chai';
import 'mocha';
import { AngularVelocity, DataSerializer, RelativeAngularVelocity, Velocity } from '../../../src';

describe('position', () => {
    describe('relative velocity', () => {
        it('should be serializable', () => {
            const position = new RelativeAngularVelocity("abc", new AngularVelocity());
            const serialized = DataSerializer.serialize(position);
            const deserialized: RelativeAngularVelocity = DataSerializer.deserialize(serialized);
            expect(deserialized.referenceValue).to.be.instanceOf(Velocity);
        });
    });
});

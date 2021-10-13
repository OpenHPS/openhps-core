import { expect } from 'chai';
import 'mocha';
import { DataSerializer, RelativeVelocity, Velocity } from '../../../src';

describe('position', () => {
    describe('relative velocity', () => {
        it('should be serializable', () => {
            const position = new RelativeVelocity("abc", new Velocity());
            const serialized = DataSerializer.serialize(position);
            const deserialized: RelativeVelocity = DataSerializer.deserialize(serialized);
            expect(deserialized.referenceValue).to.be.instanceOf(Velocity);
        });
    });
});

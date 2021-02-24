import { expect } from 'chai';
import 'mocha';
import { Absolute2DPosition, DataSerializer, LinearVelocity, RelativeRSSIPosition, Velocity } from '../../../src';

describe('position', () => {
    describe('relative rssi', () => {
        it('should be serializable', () => {
            const position = new RelativeRSSIPosition("abc", -110);
            const serialized = DataSerializer.serialize(position);
            const deserialized: RelativeRSSIPosition = DataSerializer.deserialize(serialized);
            expect(deserialized.rssi).to.equal(-110);
        });
    });
});

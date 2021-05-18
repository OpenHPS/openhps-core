import { expect } from 'chai';
import 'mocha';
import { DataSerializer, RelativeRSSI, RelativeVelocity, Velocity } from '../../../src';

describe('position', () => {
    describe('relative rssi', () => {
        it('should be serializable', () => {
            const position = new RelativeRSSI("abc", -110);
            const serialized = DataSerializer.serialize(position);
            const deserialized: RelativeRSSI = DataSerializer.deserialize(serialized);
            expect(deserialized.rssi).to.equal(-110);
        });
    });

    describe('relative velocity', () => {
        it('should be serializable', () => {
            const position = new RelativeVelocity("abc", new Velocity());
            const serialized = DataSerializer.serialize(position);
            const deserialized: RelativeVelocity = DataSerializer.deserialize(serialized);
            expect(deserialized.referenceValue).to.be.instanceOf(Velocity);
        });
    });
});

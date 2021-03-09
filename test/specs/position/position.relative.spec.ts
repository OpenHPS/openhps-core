import { expect } from 'chai';
import 'mocha';
import { Absolute2DPosition, DataSerializer, LinearVelocity, RelativeRSSI, RelativeValue, Velocity } from '../../../src';

describe('position', () => {
    describe('relative rssi', () => {
        it('should be serializable', () => {
            const position = new RelativeRSSI("abc", -110);
            const serialized = DataSerializer.serialize(position);
            const deserialized: RelativeRSSI = DataSerializer.deserialize(serialized);
            expect(deserialized.rssi).to.equal(-110);
        });
    });

    describe('relative value', () => {
        it('should support number values', () => {
            const position = new RelativeValue("abc", -110);
            const serialized = DataSerializer.serialize(position);
            const deserialized: RelativeValue = DataSerializer.deserialize(serialized);
            expect(deserialized.referenceValue).to.equal(-110);
        });
    });
});

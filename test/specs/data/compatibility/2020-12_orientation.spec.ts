import { expect } from 'chai';
import 'mocha';
import { DataSerializer, Absolute2DPosition, Orientation } from '../../../../src';

describe('data compatibility 2020-12', () => {
    describe('orientation', () => {
        it('should deserialize quaternions without a type', () => {
            const serialized = {
                x: 0,
                y: 0,
                timestamp: 1607616711288444,
                velocity: {},
                orientation: { x: 0, y: 0, z: 0, w: 1 },
                unit: { name: 'meter' },
                __type: 'Absolute2DPosition'
            };
            const deserialized: Absolute2DPosition = DataSerializer.deserialize(serialized);
            expect(deserialized.orientation).to.not.be.undefined;
            expect(deserialized.orientation).to.be.instanceOf(Orientation);
            expect(deserialized.orientation.x).to.equal(0);
        });
    });
});

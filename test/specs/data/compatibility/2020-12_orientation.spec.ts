import { expect } from 'chai';
import 'mocha';
import { DataSerializer, Absolute2DPosition, Orientation } from '../../../../src';
import { Quaternion } from '../../../../src/utils/math';

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

        it('should serialize quaternions as orientation', () => {
            const position = new Absolute2DPosition();
            position.orientation = new Quaternion(1, 2, 3, 4);
            const serialized = DataSerializer.serialize(position);
            const deserialized: Absolute2DPosition = DataSerializer.deserialize(serialized);
            expect(deserialized.orientation.x).to.equal(1);
            expect(deserialized.orientation.y).to.equal(2);
            expect(deserialized.orientation.z).to.equal(3);
            expect(deserialized.orientation.w).to.equal(4);
        });
    });
});

import { expect } from 'chai';
import 'mocha';
import { DataSerializer, Orientation } from '../../../src';

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
});

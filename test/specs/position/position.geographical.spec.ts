import { expect } from 'chai';
import 'mocha';
import { GeographicalPosition, AngleUnit } from '../../../src';

describe('position', () => {
    describe('GeographicalPosition', () => {
        it('should convert latitude and latittude to XYZ coordinates', () => {
            const pos = new GeographicalPosition(5, 6, 1);
            expect(pos.latitude).to.equal(5);
            expect(pos.longitude).to.equal(6);
            expect(pos.altitude).to.equal(1);
            expect(pos.x).to.not.equal(0);
            expect(pos.y).to.not.equal(0);
            expect(pos.z).to.not.equal(0);
        });

        it('should clone', () => {
            const pos = new GeographicalPosition(5, 6, 1);
            const copy = pos.clone();
            pos.longitude = 3;
            expect(copy.latitude).to.equal(5);
            expect(copy.longitude).to.equal(6);
            expect(copy.altitude).to.equal(1);
            expect(copy.x).to.not.equal(0);
            expect(copy.y).to.not.equal(0);
            expect(copy.z).to.not.equal(0);
        });

        it('should calculate the midpoint', () => {
            const position = new GeographicalPosition(3, 3);
            const midpoint = position.midpoint(new GeographicalPosition(5, 5));
        });

        it('should calculate the midpoint with different distances', () => {
            const position = new GeographicalPosition(3, 3);
            const midpoint = position.midpoint(new GeographicalPosition(5, 5), 1, 2);
        });

        it('should calculate the distance between two points', () => {
            const distance = new GeographicalPosition(1, 1).distanceTo(new GeographicalPosition(4, 9));
        });

        it('should calculate the bearing between two points', () => {
            const bearing = new GeographicalPosition(1, 1).bearing(new GeographicalPosition(4, 9));
        });

        it('should calculate the destination from a point in a direction', () => {
            const destination = new GeographicalPosition(1, 1).destination(100, 20, AngleUnit.DEGREE);
        });
    });
});

import { expect } from 'chai';
import 'mocha';
import { GeographicalPosition, AngleUnit, GCS, LengthUnit, Orientation, Accuracy2D } from '../../../src';

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
        expect(copy.y).to.equal(5);
        expect(copy.x).to.equal(6);
        expect(copy.z).to.equal(1);
    });

    it('should calculate the distance between two points', () => {
        const distance = new GeographicalPosition(1, 1).distanceTo(new GeographicalPosition(4, 9));
    });

    it('should calculate the bearing between two points', () => {
        const bearing = new GeographicalPosition(1, 1).bearing(new GeographicalPosition(4, 9));
    });

    it('should calculate the destination from a point in a direction', () => {
        const destination = new GeographicalPosition(1, 1, 2).destination(100, 20, AngleUnit.DEGREE);
        expect(destination.altitude).to.equal(2);
    });

    it('should convert the geographic position to EPSG3857', () => {
        const pos = new GeographicalPosition(50.820548, 4.392123, 1);
        const vector = pos.toVector3(GCS.EPSG3857);
        expect(Math.round(vector.x)).to.equal(488929);
        expect(Math.round(vector.y)).to.equal(6589612);
        const pos2 = new GeographicalPosition();
        pos2.fromVector(vector, GCS.EPSG3857);
        expect(pos2.latitude).to.equal(50.820548);
        expect(pos2.longitude).to.equal(4.392123);
    });

    it('should convert the geographical position to a vector in meters', () => {
        const pos = new GeographicalPosition(50.820548, 4.392123, 1);
        const vector = pos.toVector3(LengthUnit.METER);
        const pos2 = new GeographicalPosition();
        pos2.fromVector(vector, LengthUnit.METER);
        expect(Math.round(pos.x * 1000) / 1000).to.equal(Math.round(pos2.x * 1000) / 1000);
        expect(Math.round(pos.y * 1000) / 1000).to.equal(Math.round(pos2.y * 1000) / 1000);
        expect(Math.round(pos.z * 1000) / 1000).to.equal(Math.round(pos2.z * 1000) / 1000);
    });

    it('should convert the geographic position to ECEF when requesting in meters', () => {
        const pos = new GeographicalPosition(50.820548, 4.392123, 1);
        const vector = pos.toVector3(LengthUnit.METER);
        expect(Math.round(vector.x)).to.equal(4025669);
        expect(Math.round(vector.y)).to.equal(309202);
        expect(Math.round(vector.z)).to.equal(4920958);

        const position = new GeographicalPosition(50.820548, 4.392123, 53, GCS.WGS84)
            .setOrientation(Orientation.fromBearing(180))
            .setAccuracy(new Accuracy2D(5, 5, LengthUnit.METER));
    });
});

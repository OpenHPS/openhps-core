import { MetricLengthUnit, AngleUnit, SquareUnit, VolumeUnit } from '../../src/data/unit';

import { expect } from 'chai';
import 'mocha';
import { LengthUnit } from '../../src/data/unit/LengthUnit';

describe('units', () => {
    describe('length', () => {
        describe('metric units', () => {

            it('should convert from mm to cm', () => {
                const result = MetricLengthUnit.MILLIMETER.convert(125, MetricLengthUnit.CENTIMETER);
                expect(result).to.equal(12.5);
            });

            it('should convert from mm to m', () => {
                const result = MetricLengthUnit.MILLIMETER.convert(125, MetricLengthUnit.METER);
                expect(result).to.equal(0.125);
            });

            it('should convert from cm to km', () => {
                const result = MetricLengthUnit.CENTIMETER.convert(0.125, MetricLengthUnit.KILOMETER);
                expect(result).to.equal(0.00000125);
            });

            it('should convert from m to m', () => {
                const result = MetricLengthUnit.METER.convert(125, MetricLengthUnit.METER);
                expect(result).to.equal(125);
            });

            it('should handle small numbers', () => {
                const result = MetricLengthUnit.MILLIMETER.convert(1e-6, MetricLengthUnit.KILOMETER);
                expect(result).to.equal(1e-12);
            });

            it('should handle large numbers', () => {
                const result = MetricLengthUnit.KILOMETER.convert(1e6, MetricLengthUnit.MILLIMETER);
                expect(result).to.equal(1e13);
            });

        });
        describe('unspecified units', () => {

            it('should convert from points to points', () => {
                const result = LengthUnit.POINTS.convert(125, LengthUnit.POINTS);
                expect(result).to.equal(125);
            });

        });
    });

    describe('square', () => {
        describe('unspecified units', () => {

            it('should convert from points to points', () => {
                const result = SquareUnit.SQUARE_POINTS.convert(125, SquareUnit.SQUARE_POINTS);
                expect(result).to.equal(125);
            });

        });
    });

    describe('volume', () => {
        describe('unspecified units', () => {

            it('should convert from points to points', () => {
                const result = VolumeUnit.CUBIC_POINTS.convert(125, VolumeUnit.CUBIC_POINTS);
                expect(result).to.equal(125);
            });

        });
    });

    describe('angle', () => {

        it('should convert from degrees to radians', () => {
            const result = AngleUnit.DEGREES.convert(8594.366927, AngleUnit.RADIANS);
            expect(result).to.equal(150.00000000065714);
        });

        it('should convert from radians to degrees', () => {
            const result = AngleUnit.RADIANS.convert(2.617993878, AngleUnit.DEGREES);
            expect(result).to.equal(150.00000000048735);
        });

    });
});

import { MetricLengthUnit } from '../../src/data/unit';

import { expect } from 'chai';
import 'mocha';

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
    });
});
import {
    DataSerializer,
    LengthUnit,
    AngleUnit,
    Unit,
    UnitPrefix,
    AngularVelocityUnit,
    UnitValue,
    GCS,
    Accuracy1D,
} from '../../../src';
import { expect } from 'chai';
import 'mocha';
import { Vector2, Vector3 } from '../../../src/utils/math/_internal';

describe('Unit', () => {
    describe('registration', () => {
        it('should register units upon creation', () => {
            expect(Unit.findByName('euro')).to.be.undefined;
            const unit = new Unit('euro', {
                baseName: 'currency',
                aliases: ['euros'],
                override: true,
            });
            const result = Unit.findByName('euro');
            expect(result.name).to.equal(unit.name);
            expect(result.prefixType).to.equal('none');
            expect(result.baseName).to.equal('currency');
            expect(result.aliases[0]).to.equal('euros');
        });
    });

    describe('serializing', () => {
        it('should serialize a base unit', () => {
            const unit = new Unit('euro', {
                baseName: 'currency',
                aliases: ['euros'],
                override: true,
            });
            const serializedUnit = DataSerializer.serialize(unit);
            const deserializedUnit = DataSerializer.deserialize<Unit>(serializedUnit);
            expect(deserializedUnit.name).to.equal(unit.name);
            expect(deserializedUnit.prefixType).to.equal('none');
            expect(deserializedUnit.baseName).to.equal('currency');
            expect(deserializedUnit.aliases[0]).to.equal('euros');
        });

        it('should serialize a unit and definitions', () => {
            new Unit('euro', {
                baseName: 'currency',
                aliases: ['euros', 'eur'],
                override: true,
            });
            const unit = new Unit('united states dollar', {
                baseName: 'currency',
                aliases: ['usd', '$', 'united states dollars'],
                definitions: [{ magnitude: 8.5e-1, unit: 'eur' }],
            });
            // First check if our assumptions of the unit are correct
            expect(unit.name).to.equal(unit.name);
            expect(unit.prefixType).to.equal('none');
            expect(unit.baseName).to.equal('currency');
            expect(unit.aliases[0]).to.equal('usd');
            expect(unit.definitions[0]).to.not.be.undefined;

            const serializedUnit = DataSerializer.serialize(unit);
            const deserializedUnit = DataSerializer.deserialize<Unit>(serializedUnit);

            expect(deserializedUnit.name).to.equal(unit.name);
            expect(deserializedUnit.prefixType).to.equal('none');
            expect(deserializedUnit.baseName).to.equal('currency');
            expect(deserializedUnit.aliases[0]).to.equal('usd');
            expect(deserializedUnit.definitions[0]).to.not.be.undefined;
        });

        it('should not deserialize an unknown unit', (done) => {
            const serialized = {
                name: 'abc',
                __type: 'Unit',
            };
            try {
                const deserialized = DataSerializer.deserialize(serialized);
                done(`No error thrown!`);
            } catch (ex) {
                done();
            }
        });

        it('should deserialize a derived unit', () => {
            const u1 = AngularVelocityUnit.RADIAN_PER_SECOND;
            const serialized = DataSerializer.serialize(u1);
            const deserialized = DataSerializer.deserialize(serialized, Unit);
            expect(deserialized).to.eql(u1);
        });
    });

    describe('deserializing', () => {
        it('should deserialize a unit', () => {
            const accuracy = new Accuracy1D(10, AngleUnit.DEGREE);
            const serialized = DataSerializer.serialize(accuracy);
            const deserialized = DataSerializer.deserialize(serialized) as any;
            expect(deserialized._unit).to.be.instanceOf(AngleUnit);
        });
    });

    describe('parsing', () => {
        it('should find units by their full base unit name', () => {
            const unit = Unit.findByName('meter');
            expect(unit.name).to.equal('meter');
            expect(unit.baseName).to.equal('length');
        });

        it('should find units by their alias name and base name', () => {
            const unit = Unit.findByName('m', 'length');
            expect(unit.name).to.equal('meter');
            expect(unit.baseName).to.equal('length');
        });

        it('should find units by their alias name', () => {
            const unit = Unit.findByName('cm');
            expect(unit.name).to.equal('centimeter');
            expect(unit.baseName).to.equal('length');
        });

        it('should find units by their prefix name', () => {
            const unit = Unit.findByName('centimeter');
            expect(unit.name).to.equal('centimeter');
            expect(unit.baseName).to.equal('length');
        });

        it('should find units by their prefix alias', () => {
            const unit = Unit.findByName('cm');
            expect(unit.name).to.equal('centimeter');
            expect(unit.baseName).to.equal('length');
        });
    });

    describe('converting', () => {
        it('should convert from unit instance to another unit instance', () => {
            const unit = Unit.findByName('centimeter');
            expect(unit.convert(125, Unit.findByName('meter'))).to.equal(1.25);
        });

        it('should convert from unit name to another unit name', () => {
            expect(Unit.convert(125, 'cm', 'm')).to.equal(1.25);
        });
    });

    describe('length', () => {
        it('should convert from mm to cm', () => {
            const result = LengthUnit.MILLIMETER.convert(125, LengthUnit.CENTIMETER);
            expect(result).to.equal(12.5);
        });

        it('should convert from mm to m', () => {
            const result = LengthUnit.MILLIMETER.convert(125, LengthUnit.METER);
            expect(result).to.equal(0.125);
        });

        it('should convert from cm to km', () => {
            const result = LengthUnit.CENTIMETER.convert(0.125, LengthUnit.KILOMETER);
            expect(result).to.equal(0.00000125);
        });

        it('should convert from m to m', () => {
            const result = LengthUnit.METER.convert(125, LengthUnit.METER);
            expect(result).to.equal(125);
        });

        it('should convert from nm to m', () => {
            const result = LengthUnit.METER.specifier(UnitPrefix.NANO).convert(125, LengthUnit.METER);
            expect(result).to.equal(1.2500000000000002e-7); // TODO: Round instead
        });

        it('should convert from miles to m', () => {
            const result = LengthUnit.METER.convert(152, LengthUnit.MILE);
            expect(result).to.equal(0.09444842122007475);
        });

        it('should handle small numbers', () => {
            const result = LengthUnit.MILLIMETER.convert(1e-6, LengthUnit.KILOMETER);
            expect(result).to.equal(1e-12);
        });

        it('should handle large numbers', () => {
            const result = LengthUnit.KILOMETER.convert(1e6, LengthUnit.MILLIMETER);
            expect(result).to.equal(1e12);
        });
    });

    describe('angle', () => {
        it('should convert from degrees to radians', () => {
            const result = AngleUnit.DEGREE.convert(8594.366927, AngleUnit.RADIAN);
            expect(result).to.equal(150.00000000065714);
        });

        it('should convert from radians to degrees', () => {
            const result = AngleUnit.RADIAN.convert(2.617993878, AngleUnit.DEGREE);
            expect(result).to.equal(150.00000000048735);
        });
    });

    describe('derived units', () => {
        it('should convert deg/s to rad/s', () => {
            const result = AngularVelocityUnit.DEGREE_PER_SECOND.convert(90, AngularVelocityUnit.RADIAN_PER_SECOND);
            expect(Math.round(result * 100) / 100).to.equal(1.57);
        });

        it('should convert rad/s to rad/min', () => {
            const result = AngularVelocityUnit.RADIAN_PER_SECOND.convert(1, AngularVelocityUnit.RADIAN_PER_MINUTE);
            expect(result).to.equal(60);
        });

        it('should convert deg/min to rad/s', () => {
            const result = AngularVelocityUnit.DEGREE_PER_MINUTE.convert(1, AngularVelocityUnit.RADIAN_PER_SECOND);
            expect(result).to.equal(0.0002908882086657216);
        });
    });

    describe('unit value', () => {
        it('should convert', () => {
            const value = new UnitValue(5, LengthUnit.METER);
            const converted = value.to(LengthUnit.CENTIMETER);
            expect(converted.valueOf()).to.equal(500);
            expect(converted.unit.name).to.equal('centimeter');
        });

        it('should be serializable', () => {
            const value = new UnitValue(5, LengthUnit.METER);
            const serialized = DataSerializer.serialize(value);
            const deserialized = DataSerializer.deserialize(serialized);
            expect(deserialized.valueOf()).to.eq(value.valueOf());
        });
    });

    describe('definition order', () => {
        const CELCIUS = new Unit('celcius', {
            baseName: 'temperature',
        });

        const FAHRENHEIT = new Unit('fahrenheit', {
            baseName: 'temperature',
            definitions: [{ unit: 'celcius', offset: -32, magnitude: 5 / 9 }],
        });

        const KELVIN = new Unit('kelvin', {
            baseName: 'temperature',
            definitions: [{ unit: 'celcius', offset: -273.15 }],
        });

        const RANKINE = new Unit('rankine', {
            baseName: 'temperature',
            definitions: [{ unit: 'kelvin', magnitude: 1 / 1.8 }],
        });

        it('should convert celcius to fahrenheit', () => {
            const result = CELCIUS.convert(100, FAHRENHEIT);
            expect(Math.round(result)).to.equal(212);
        });

        it('should convert fahrenheit to celcius', () => {
            const result = FAHRENHEIT.convert(99, CELCIUS);
            expect(result).to.equal(37.22222222222222);
        });

        it('should convert kelvin to fahrenheit', () => {
            const result = KELVIN.convert(100, FAHRENHEIT);
            expect(Math.round(result)).to.equal(-280);
        });

        it('should convert fahrenheit to kelvin', () => {
            const result = FAHRENHEIT.convert(100, KELVIN);
            expect(Math.round(result)).to.equal(311);
        });

        it('should convert rankine to celcius', () => {
            const result = RANKINE.convert(100, CELCIUS);
            expect(Math.round(result)).to.equal(-218);
        });

        it('should convert kelvin to rankine', () => {
            const result = KELVIN.convert(100, RANKINE);
            expect(Math.round(result)).to.equal(180);
        });

        it('should convert celcius to rankine', () => {
            const result = CELCIUS.convert(100, RANKINE);
            expect(Math.round(result)).to.equal(672);
        });

        it('should convert rankine to fahrenheit', () => {
            const result = RANKINE.convert(100, FAHRENHEIT);
            expect(Math.round(result)).to.equal(-360);
        });

        it('should convert fahrenheit to rankine', () => {
            const result = FAHRENHEIT.convert(100, RANKINE);
            expect(Math.round(result)).to.equal(560);
        });
    });

    describe('gcs', () => {
        it('should convert WGS84 to ECEF', () => {
            const input = new Vector3(50, 4, 0);
            const output = GCS.WGS84.convert(input, GCS.ECEF);
        });
    });
});

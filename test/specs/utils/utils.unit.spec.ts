import { LengthUnit, AngleUnit, Unit, UnitPrefix } from '../../../src/utils/unit';

import { expect } from 'chai';
import 'mocha';
import { DataSerializer } from '../../../src/data/DataSerializer';

describe('units', () => {

    describe('registration', () => {

        it('should register units upon creation', () => {
            expect(Unit.findByName("euro")).to.be.undefined;
            const unit = new Unit("euro", {
                baseName: "currency",
                aliases: ["euros"],
                override: true
            });
            const result = Unit.findByName("euro");
            expect(result.name).to.equal(unit.name);
            expect(result.prefixType).to.equal('none');
            expect(result.baseName).to.equal('currency');
            expect(result.aliases[0]).to.equal('euros');
        });

    });

    describe('serializing', () => {

        it('should serialize a base unit', () => {
            const unit = new Unit("euro", {
                baseName: "currency",
                aliases: ["euros"],
                override: true
            });
            const serializedUnit = DataSerializer.serialize(unit);
            const deserializedUnit = DataSerializer.deserialize<Unit>(serializedUnit);
            expect(deserializedUnit.name).to.equal(unit.name);
            expect(deserializedUnit.prefixType).to.equal('none');
            expect(deserializedUnit.baseName).to.equal('currency');
            expect(deserializedUnit.aliases[0]).to.equal('euros');
        });

        it('should serialize a unit and definitions', () => {
            new Unit("euro", {
                baseName: "currency",
                aliases: ["euros", "eur"],
                override: true
            });
            const unit = new Unit("united states dollar", {
                baseName: "currency",
                aliases: ["usd", "$", "united states dollars"],
                definitions: [
                    { magnitude: 8.5e-1, unit: "eur" }
                ]
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
    
        // it('should not deserialize an unknown unit', (done) => {
        //     const serialized = {
        //         name: "abc",
        //         __type: "Unit"
        //     };
        //     try {
        //         const deserialized = DataSerializer.deserialize(serialized);
        //         console.log(deserialized);
        //         done(`No error thrown!`);
        //     } catch (ex) {
        //         done();
        //     }
        // });

    });

    describe('parsing', () => {
        
        it('should find units by their full base unit name', () => {
            const unit = Unit.findByName("meter");
            expect(unit.name).to.equal("meter");
            expect(unit.baseName).to.equal("length");
        });

        it('should find units by their alias name and base name', () => {
            const unit = Unit.findByName("m", "length");
            expect(unit.name).to.equal("meter");
            expect(unit.baseName).to.equal("length");
        });

        it('should find units by their alias name', () => {
            const unit = Unit.findByName("cm");
            expect(unit.name).to.equal("centimeter");
            expect(unit.baseName).to.equal("length");
        });

        it('should find units by their prefix name', () => {
            const unit = Unit.findByName("centimeter");
            expect(unit.name).to.equal("centimeter");
            expect(unit.baseName).to.equal("length");
        });

        it('should find units by their prefix alias', () => {
            const unit = Unit.findByName("cm");
            expect(unit.name).to.equal("centimeter");
            expect(unit.baseName).to.equal("length");
        });

    });

    describe('converting', () => {

        it('should convert from unit instance to another unit instance', () => {
            const unit = Unit.findByName("centimeter");
            expect(unit.convert(125, Unit.findByName("meter"))).to.equal(1.25);
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
});

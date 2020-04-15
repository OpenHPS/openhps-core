import { expect } from 'chai';
import 'mocha';
import { DataObject, RelativeDistanceLocation, Cartesian2DLocation, RelativeLocation } from '../../../src';
import { DummySensorObject } from '../../mock/data/object/DummySensorObject';
import { DataSerializer } from '../../../src/data/DataSerializer';

describe('data', () => {
    describe('object', () => {

        it('should be serializable and deserializable', (done) => {
            const dataObject = new DataObject("123");
            dataObject.displayName = "abc";
            dataObject.setNodeData('x', { test: [1, 2, 3] });
            dataObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("ref_a"), 1));
            dataObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("ref_b"), 2));
            dataObject.addRelativeLocation(new RelativeDistanceLocation(new DataObject("ref_c"), 3));
            dataObject.addRelativeLocation(new RelativeLocation("ref_x", 10.5));
            const serialized = DataSerializer.serialize(dataObject);
            const deserialized = DataSerializer.deserialize(serialized, DataObject);
            expect(dataObject.uid).to.equal(deserialized.uid);
            expect(dataObject.displayName).to.equal(deserialized.displayName);
            done();
        });

        describe('querying', () => {
            var fingerprints: Map<string, DataObject> = new Map();

            before(() => {
                const beacons: Array<DataObject> = new Array();
                for (let i = 0 ; i < 10 ; i ++) {
                    const beacon = new DataObject();
                    beacon.currentLocation = new Cartesian2DLocation(Math.floor(Math.random() * 500) + 0, Math.floor(Math.random() * 500) + 0);
                    beacons.push(beacon);
                }
                const addFingerprint = (data: DataObject) => {
                    fingerprints.set(data.uid, DataSerializer.serialize<DataObject>(data));
                };

                for (let i = 0 ; i < 250 ; i++) {
                    const fingerprint = new DataObject()
                    fingerprint.currentLocation = new Cartesian2DLocation(Math.floor(Math.random() * 500) + 0, Math.floor(Math.random() * 500) + 0);
                    const nrLocations = Math.floor(Math.random() * 8) + 3;
                    for (let j = 0 ; j < nrLocations ; j++) {
                        const beacon = beacons[Math.floor(Math.random() * (beacons.length - 1)) + 0]
                        if (!fingerprint.hasRelativeLocation(beacon.uid)) {
                            fingerprint.addRelativeLocation(new RelativeDistanceLocation(beacon, Math.floor(Math.random() * 40) + 1))
                        }
                    }
                    addFingerprint(fingerprint);
                }
            });

            it('should be queryable', (done) => {
                const values = Array.from(fingerprints.values());
                // const result = JSONPath({ path: `$[?(JSON.stringify(currentLocation) == "${JSON.stringify(values[1].currentLocation)}")]`, json: values });
                // console.log(result);
                done();
            });

        });
    });

    describe('sensor object', () => {

        it('should be serializable and deserializable', (done) => {
            const dataObject = new DummySensorObject("123");
            dataObject.displayName = "abc";
            dataObject.setNodeData('x', { test: [1, 2, 3] });
            dataObject.horizontalFOV = 15;
            const serialized = DataSerializer.serialize(dataObject);
            const deserialized = DataSerializer.deserialize(serialized, DummySensorObject);
            expect(dataObject.uid).to.equal(deserialized.uid);
            expect(dataObject.displayName).to.equal(deserialized.displayName);
            expect(dataObject.horizontalFOV).to.equal(15);
            done();
        });

    });
});
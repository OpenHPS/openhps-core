import { expect } from 'chai';
import 'mocha';
import { DataObject, RelativeDistancePosition, Absolute2DPosition, RelativePosition, ReferenceSpace } from '../../../src';
import { DummySensorObject } from '../../mock/data/object/DummySensorObject';
import { DataSerializer } from '../../../src/data/DataSerializer';

describe('data', () => {
    describe('object', () => {

        it('should be serializable and deserializable', (done) => {
            const dataObject = new DataObject("123");
            dataObject.displayName = "abc";
            dataObject.addNodeData('x', { test: [1, 2, 3] });
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject("ref_a"), 1));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject("ref_b"), 2));
            dataObject.addRelativePosition(new RelativeDistancePosition(new DataObject("ref_c"), 3));
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
                    beacon.currentPosition = new Absolute2DPosition(Math.floor(Math.random() * 500) + 0, Math.floor(Math.random() * 500) + 0);
                    beacons.push(beacon);
                }
                const addFingerprint = (data: DataObject) => {
                    fingerprints.set(data.uid, DataSerializer.serialize<DataObject>(data));
                };

                for (let i = 0 ; i < 250 ; i++) {
                    const fingerprint = new DataObject()
                    fingerprint.currentPosition = new Absolute2DPosition(Math.floor(Math.random() * 500) + 0, Math.floor(Math.random() * 500) + 0);
                    const nrPositions = Math.floor(Math.random() * 8) + 3;
                    for (let j = 0 ; j < nrPositions ; j++) {
                        const beacon = beacons[Math.floor(Math.random() * (beacons.length - 1)) + 0]
                        if (!fingerprint.getRelativePositions(beacon.uid)) {
                            fingerprint.addRelativePosition(new RelativeDistancePosition(beacon, Math.floor(Math.random() * 40) + 1))
                        }
                    }
                    addFingerprint(fingerprint);
                }
            });

            it('should be queryable', (done) => {
                const values = Array.from(fingerprints.values());
                // const result = JSONPath({ path: `$[?(JSON.stringify(currentPosition) == "${JSON.stringify(values[1].currentPosition)}")]`, json: values });
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
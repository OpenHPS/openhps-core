import { expect } from 'chai';
import 'mocha';
import { Absolute2DPosition, CallbackSinkNode, DataFrame, DataObject, Fingerprint, IMUSensorObject, KNNFingerprintingNode, MemoryDataService, ModelBuilder, RelativeRSSIPosition, RelativeValue, RFTransmitterObject } from '../../../../src';
import { FingerprintService } from '../../../../src/service/FingerprintService';

describe('node knn fingerprinting', () => {

    it('should initialize without fingerprints', (done) => {
        ModelBuilder.create()
            .addService(new FingerprintService(new MemoryDataService(Fingerprint)))
            .from()
            .via(new KNNFingerprintingNode({
                weighted: false,
                k: 5
            }))
            .to()
            .build().then(m => {
                done();
            }).catch(done);
    });

    it('should support multiple types of ffingerprints', (done) => {
        ModelBuilder.create()
            .addService(new FingerprintService(new MemoryDataService(Fingerprint), {
                classifier: "geo"
            }))
            .addService(new FingerprintService(new MemoryDataService(Fingerprint), {
                classifier: "wlan"
            }))
            .from()
            .via(new KNNFingerprintingNode({
                weighted: false,
                k: 5,
                valueFilter: (pos) => pos.referenceObjectUID.startsWith("MAG_"),
                classifier: "geo",
                name: "geomagnetic-fingerprinting",
                autoUpdate: true
            }), new KNNFingerprintingNode({
                weighted: false,
                k: 5,
                valueFilter: (pos) => pos.referenceObjectType === RFTransmitterObject.name,
                classifier: "wlan",
                name: "wlan-fingerprinting",
                autoUpdate: true
            }))
            .to(new CallbackSinkNode())
            .build().then(m => {
                const object = new DataObject("phone");
                object.setPosition(new Absolute2DPosition(1, 1));
                object.addRelativePosition(new RelativeValue("MAG_X", 1));
                object.addRelativePosition(new RelativeValue("MAG_Y", 2));
                object.addRelativePosition(new RelativeValue("MAG_Z", 3));
                object.addRelativePosition(new RelativeRSSIPosition(new RFTransmitterObject("AP_1"), 4));
                object.addRelativePosition(new RelativeRSSIPosition(new RFTransmitterObject("AP_2"), 5));
                object.addRelativePosition(new RelativeRSSIPosition(new RFTransmitterObject("AP_3"), 6));
                const frame = new DataFrame(object);
                m.onceCompleted(frame.uid).then(() => {
                    const node1 = m.findNodeByName("geomagnetic-fingerprinting") as KNNFingerprintingNode<any>;
                    const node2 = m.findNodeByName("wlan-fingerprinting") as KNNFingerprintingNode<any>;
                    expect(node1.cache.length).to.be.equal(1);
                    expect(node2.cache.length).to.be.equal(1);
                    expect(node1.cache[0].vector.length).to.equal(3);
                    expect(node2.cache[0].vector.length).to.equal(3);
                    done();
                }).catch(done);
                m.push(frame);
            }).catch(done);
    });

});

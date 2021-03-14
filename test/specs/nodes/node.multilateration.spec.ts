import { expect } from 'chai';
import 'mocha';
import {
    LoggingSinkNode,
    ModelBuilder,
    ListSourceNode,
    DataFrame,
    DataObject,
    Absolute2DPosition,
    RelativeAngle,
    AngleUnit,
    TriangulationNode, 
    RelativeRSSIProcessing,
    CallbackSinkNode,
    RelativeRSSI,
    RFTransmitterObject
} from '../../../src';

describe('node multilateration', () => {
    it('should convert relative rssi to relative distance', (done) => {
        ModelBuilder.create()
            .from()
            .via(new RelativeRSSIProcessing({
                environmentFactor: 1
            }))
            .to(new CallbackSinkNode(frame => {
                expect(frame.source.relativePositions.length).to.equal(3);
                done();
            })).build().then(model => {
                model.on('error', done);
                const object = new DataObject();
                object.addRelativePosition(new RelativeRSSI("BEACON_1", -20));
                object.addRelativePosition(new RelativeRSSI("BEACON_2", -10));
                const beacon1 = new RFTransmitterObject("BEACON_1");
                beacon1.calibratedRSSI = -20;
                const frame = new DataFrame(object);
                frame.addObject(beacon1);
                return model.push(frame);
            }).catch(done);
    });
});

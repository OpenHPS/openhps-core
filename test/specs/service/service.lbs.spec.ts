import { Absolute3DPosition, CallbackNode, CallbackSourceNode, DataFrame, DataObject, LocationBasedService, Model, ModelBuilder, TimeService } from '../../../src';
import { expect } from 'chai';
import 'mocha';

describe('LocationBasedService', () => {
    let model: Model;
    const service = new LocationBasedService();

    before((done) => {
        TimeService.initialize();
        ModelBuilder.create()
            .addService(service)
            .from(new CallbackSourceNode(() => {
                const object = new DataObject("mvdewync");
                object.setPosition(new Absolute3DPosition(
                    3,
                    2,
                    1
                ));
                return new DataFrame(object);
            }))
            .store()
            .build().then(m => {
                model = m;
                const object = new DataObject("mvdewync");
                const position = new Absolute3DPosition(1, 2, 3);
                position.timestamp = 0;
                object.setPosition(position);
                return model.push(new DataFrame(object));
            }).then(() => {
                done();
            }).catch(done);
    });

    describe('getCurrentPosition', () => {

        it('should return the current position without maxage', (done) => {
            service.getCurrentPosition("mvdewync").then(position => {
                expect(position.toVector3().x).to.equal(1);
                expect(position.toVector3().y).to.equal(2);
                expect(position.toVector3().z).to.equal(3);
                expect(position.timestamp).to.equal(0);
                done();
            }).catch(done);
        });

        it('should return the current position with maxage', (done) => {
            service.getCurrentPosition("mvdewync", {
                maximumAge: 10000
            }).then(position => {
                expect(position.toVector3().x).to.equal(3);
                expect(position.toVector3().y).to.equal(2);
                expect(position.toVector3().z).to.equal(1);
                done();
            }).catch(done);
        });

    });

});

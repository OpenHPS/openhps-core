import 'mocha';
import { expect } from 'chai';

import { CalibrationNode, CallbackSinkNode, DataFrame, DataObject, Model, ModelBuilder } from '../../../src';
import { CustomCalibrationService } from '../../mock/services/CustomCalibrationService';

describe('CalibrationService', () => {
    let model: Model;
    let sink: CallbackSinkNode<DataFrame> = new CallbackSinkNode();
    let service: CustomCalibrationService = new CustomCalibrationService();

    before((done) => {
        ModelBuilder.create()
            .addService(service)
            .from()
            .via(new CalibrationNode({
                service: CustomCalibrationService
            }))
            .to(sink)
            .build().then((m) => {
                model = m;
                done();
            }).catch(done);
    });

    it('should not intercept messages when not calibrating', (done) => {
        sink.callback = (frame) => {
            if (frame) {
                done();
            }
        };
        model.push(new DataFrame());
    });

    it('should intercept messages when calibrating', (done) => {
        sink.callback = () => {
            done(new Error(`Message not intercepted!`));
        };
        service.calibrate(1000).then(() => done()).catch(done);
        setTimeout(() => {
            model.push(new DataFrame());  
        }, 10);
    });

    it('should perform calibration', (done) => {
        sink.callback = () => {
            done(new Error(`Message not intercepted!`));
        };
        service.calibrate(1000).then((count) => {
            expect(count).to.eql(3);
            done();
        }).catch(done);
        setTimeout(() => {
            model.push(new DataFrame(new DataObject("abc")));
            model.push(new DataFrame(new DataObject("test")));
            model.push(new DataFrame(new DataObject("abc")));
            model.push(new DataFrame(new DataObject("test")));
            model.push(new DataFrame(new DataObject("test")));  
        }, 10);
    });

    it('should stop intercepting data frames after stopping a calibration', (done) => {
        let running = true;
        sink.callback = () => {
            if (running) {
                done(new Error(`Message not intercepted!`));
            } else {
                done();
            }
        };
        service.calibrate(1000).then(() => {
            running = false;
            return model.push(new DataFrame());
        }).catch(done);
        setTimeout(() => {
            model.push(new DataFrame());  
        }, 10);
    });

    
    it('should stop triggering callbacks when suspended', (done) => {
        let running = true;
        let suspended = false;
        sink.callback = () => {
            if (running) {
                done(new Error(`Message not intercepted!`));
            } else {
                done();
            }
        };
        service.calibrate(1000).then((count) => {
            running = false;
            expect(count).to.eql(3);
            return model.push(new DataFrame());
        }).catch(done);

        setTimeout(() => {
            model.push(new DataFrame(new DataObject("test")));  
            model.push(new DataFrame(new DataObject("test")));  
            model.push(new DataFrame(new DataObject("test")));  
            setTimeout(() => {
                suspended = true;
                (service as any).suspend();
                model.push(new DataFrame(new DataObject("test")));  
            }, 10);
        }, 10);
    });
});

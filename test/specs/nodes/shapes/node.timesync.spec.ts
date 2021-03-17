import { expect } from 'chai';
import 'mocha';
import {
    CallbackSinkNode,
    DataFrame,
    ModelBuilder,
    TimeService,
    TimeSyncNode,
} from '../../../../src';

describe('node', () => {
    describe('time sync', () => {
        it('should synchronize data frames', (done) => {
            let i = 0;
            function createFrame() {
                const frame = new DataFrame();
                frame.createdTimestamp = i;
                i += 5000;
                return frame;
            }
            let time = 0;
            let count = 0;
            ModelBuilder.create()
                .addService(new TimeService(() => time))
                .from()
                .via(new TimeSyncNode())
                .to(
                    new CallbackSinkNode(frame => {
                        return new Promise((resolve) => {
                            count++;
                            resolve();
                        });
                    }),
                )
                .build()
                .then((model) => {
                    Promise.all([
                        model.push(createFrame()),
                        model.push(createFrame()),
                        model.push(createFrame()),
                        model.push(createFrame()),
                        model.push(createFrame()),
                        model.push(createFrame()),
                        model.push(createFrame()),
                        model.push(createFrame()),
                    ]).then(() => {
                        expect(count).to.equal(0);
                        model.destroy();
                        done();
                    });
                });
        }).timeout(1000);
    });
});

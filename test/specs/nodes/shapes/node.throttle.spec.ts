import { expect } from 'chai';
import 'mocha';
import {
    CallbackSinkNode,
    DataFrame,
    DataObject,
    ModelBuilder,
    ThrottleNode,
} from '../../../../src';

describe('node', () => {
    describe('throttle', () => {
        it('should throttle data frames', (done) => {
            let count = 0;
            ModelBuilder.create()
                .from()
                .via(new ThrottleNode())
                .to(
                    new CallbackSinkNode(frame => {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                count++;
                                if (count === 10) {
                                    done();
                                }
                                resolve();
                            }, 50);
                        });
                    }),
                )
                .build()
                .then((model) => {
                    Promise.all([
                        model.push(new DataFrame(new DataObject('a'))),
                        model.push(new DataFrame(new DataObject('b'))),
                        model.push(new DataFrame(new DataObject('c'))),
                        model.push(new DataFrame(new DataObject('d'))),
                        model.push(new DataFrame(new DataObject('e'))),
                        model.push(new DataFrame(new DataObject('f'))),
                        model.push(new DataFrame(new DataObject('g'))),
                        model.push(new DataFrame(new DataObject('h'))),
                        model.push(new DataFrame(new DataObject('i'))),
                        model.push(new DataFrame(new DataObject('j'))),
                    ]).then(() => {
                        
                    });
                });
        }).timeout(1000);
    });
});

import 'mocha';
import { CallbackSinkNode, CallbackSourceNode, DataFrame, DataObject, ModelBuilder } from '../../../../src';

describe('node', () => {
    describe('frame clone node', () => {
        it('should clone the frame for each output node', (done) => {
            ModelBuilder.create()
                .from(
                    new CallbackSourceNode(() => {
                        const frame = new DataFrame(new DataObject('abc'));
                        return frame;
                    }),
                )
                .clone()
                .to(
                    new CallbackSinkNode((frame) => {
                        done();
                    }),
                )
                .build()
                .then((model) => {
                    Promise.resolve(model.pull()).finally(() => {
                        model.emit('destroy');
                    });
                })
                .catch((ex) => {
                    done(ex);
                });
        });
    });
});

import { expect } from 'chai';
import 'mocha';
import { DataFrame, DataObject, ModelBuilder, CallbackSourceNode, TimedPullNode, TimeUnit } from '../../../../src';

describe('node', () => {
    describe('timed pull', () => {

        it('should automatically pull', (done) => {
            ModelBuilder.create()
                .from(new CallbackSourceNode(function() {
                    done();
                    this.graph.emit('destroy');
                    return null;
                }))
                .via(new TimedPullNode(100, TimeUnit.MILLISECOND))
                .to()
                .build().then(model => {
                    
                });
        });

        it('should reset the timer when a frame is pushed', (done) => {
            let model = null;
            ModelBuilder.create()
                .from(new CallbackSourceNode(function() {
                    done(`Pull request received when not expected`);
                    return null;
                }))
                .via(new TimedPullNode(800, TimeUnit.MILLISECOND))
                .to()
                .build().then(m => {
                    model = m;
                    return new Promise((resolve, _) => setTimeout(() => resolve(), 500));
                }).then(() => {
                    return model.push(new DataFrame()); // Timer should have reset
                }).then(() => {
                    return new Promise((resolve, _) => setTimeout(() => resolve(), 500));
                }).then(() => {    
                    return model.emitAsync('destroy');
                }).then(() => {    
                    done();
                });
        });

    });
});
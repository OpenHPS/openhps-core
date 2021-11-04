import { expect } from 'chai';
import 'mocha';
import { ModelBuilder, DataObject, Absolute2DPosition, CallbackSinkNode, Model, HistorySourceNode } from '../../../src';

describe('node history source', () => {
    it('should load source objects from memory', (done) => {
        let model: Model;
        ModelBuilder.create()
            .from(new HistorySourceNode())
            .to(
                new CallbackSinkNode((frame) => {
                    expect(frame.getObjects()[0].uid).to.equal('test');
                    done();
                }),
            )
            .build()
            .then((m: Model) => {
                model = m;
                model.on('error', done);
                const object = new DataObject('test');
                object.displayName = 'maxim';
                object.setPosition(new Absolute2DPosition(3, 3));
                return model.findDataService(DataObject).insert(object.uid, object);
            })
            .then(() => {
                return model.pull({
                    requestedObjects: ['test'],
                });
            })
            .catch(done);
    });
});

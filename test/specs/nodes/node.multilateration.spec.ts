import { expect } from 'chai';
import 'mocha';
import {
    Absolute2DPosition,
    CallbackSinkNode,
    DataFrame,
    DataObject,
    GeographicalPosition,
    Model,
    ModelBuilder,
    MultilaterationNode,
    RelativeDistance,
    RelativePosition,
} from '../../../src';

describe('MultilaterationNode', () => {
    let model: Model<any, any>;
    const sink = new CallbackSinkNode();

    before(function (done) {
        ModelBuilder.create()
            .from()
            .via(new MultilaterationNode({}))
            .to(sink)
            .build()
            .then((m) => {
                model = m;
                done();
            })
            .catch(done);
    });

    it('should not crash on 0 reference positions', (done) => {
        sink.callback = (frame: DataFrame) => {
            expect(frame.source.uid).to.eql('dummy');
            done();
        };
        const object = new DataObject('dummy');
        const frame = new DataFrame(object);
        model.push(frame);
    });

    it('should work with 1 reference position (2d)', (done) => {
        sink.callback = (frame: DataFrame) => {
            expect(frame.source.uid).to.eql('dummy');
            expect(frame.source.position).to.not.be.undefined;
            expect(frame.source.position.toVector3().x).to.eql(5);
            expect(frame.source.position.toVector3().y).to.eql(4);
            expect(frame.source.position.accuracy.valueOf()).to.eql(12);
            done();
        };
        const object = new DataObject('dummy');
        object.addRelativePosition(new RelativeDistance('1', 10));
        const frame = new DataFrame(object);
        frame.addObject(new DataObject('1').setPosition(new Absolute2DPosition(5, 4)));
        model.push(frame);
    });

    it('should work with 2 reference positions (2d)', (done) => {
        sink.callback = (frame: DataFrame) => {
            expect(frame.source.uid).to.eql('dummy');
            expect(frame.source.position).to.not.be.undefined;
            expect(frame.source.position.toVector3().x).to.eql(7.5);
            expect(frame.source.position.toVector3().y).to.eql(6);
            expect(frame.source.position.accuracy.valueOf()).to.eql(1);
            done();
        };
        const object = new DataObject('dummy');
        object.addRelativePosition(new RelativeDistance('1', 10));
        object.addRelativePosition(new RelativeDistance('2', 10));
        const frame = new DataFrame(object);
        frame.addObject(new DataObject('1').setPosition(new Absolute2DPosition(5, 4)));
        frame.addObject(new DataObject('2').setPosition(new Absolute2DPosition(10, 8)));
        model.push(frame);
    });

    it('should work with 2 reference positions (geographical)', (done) => {
        sink.callback = (frame: DataFrame) => {
            expect(frame.source.uid).to.eql('dummy');
            expect(frame.source.position).to.not.be.undefined;
            expect(frame.source.position.toVector3().x).to.eql(5.988499184281314);
            expect(frame.source.position.toVector3().y).to.eql(7.504519342622283);
            expect(frame.source.position.accuracy.valueOf()).to.eql(1);
            done();
        };
        const object = new DataObject('dummy');
        object.addRelativePosition(new RelativeDistance('1', 10));
        object.addRelativePosition(new RelativeDistance('2', 10));
        const frame = new DataFrame(object);
        frame.addObject(new DataObject('1').setPosition(new GeographicalPosition(5, 4)));
        frame.addObject(new DataObject('2').setPosition(new GeographicalPosition(10, 8)));
        model.push(frame);
    });

    it('should work with 3 reference positions (2d)', (done) => {
        sink.callback = (frame: DataFrame) => {
            expect(frame.source.uid).to.eql('dummy');
            expect(frame.source.position).to.not.be.undefined;
            expect(frame.source.position.toVector3().x).to.eql(6.981955345159472);
            expect(frame.source.position.toVector3().y).to.eql(4.6516093551643705);
            expect(frame.source.position.accuracy.valueOf()).to.eql(1);
            done();
        };
        const object = new DataObject('dummy');
        object.addRelativePosition(new RelativeDistance('1', 10));
        object.addRelativePosition(new RelativeDistance('2', 10));
        object.addRelativePosition(new RelativeDistance('3', 10));
        const frame = new DataFrame(object);
        frame.addObject(new DataObject('1').setPosition(new Absolute2DPosition(5, 4)));
        frame.addObject(new DataObject('2').setPosition(new Absolute2DPosition(10, 8)));
        frame.addObject(new DataObject('3').setPosition(new Absolute2DPosition(8, 3)));
        model.push(frame);
    });

    it('should work with >3 reference positions (2d)', (done) => {
        sink.callback = (frame: DataFrame) => {
            expect(frame.source.uid).to.eql('dummy');
            expect(frame.source.position).to.not.be.undefined;
            expect(frame.source.position.toVector3().x).to.eql(9.975);
            expect(frame.source.position.toVector3().y).to.eql(7.25);
            expect(frame.source.position.accuracy.valueOf()).to.eql(1);
            done();
        };
        const object = new DataObject('dummy');
        object.addRelativePosition(new RelativeDistance('1', 10));
        object.addRelativePosition(new RelativeDistance('2', 10));
        object.addRelativePosition(new RelativeDistance('3', 10));
        object.addRelativePosition(new RelativeDistance('4', 10));
        const frame = new DataFrame(object);
        frame.addObject(new DataObject('1').setPosition(new Absolute2DPosition(5, 4)));
        frame.addObject(new DataObject('2').setPosition(new Absolute2DPosition(10, 8)));
        frame.addObject(new DataObject('3').setPosition(new Absolute2DPosition(8, 3)));
        frame.addObject(new DataObject('4').setPosition(new Absolute2DPosition(15, 14)));
        model.push(frame);
    });
});

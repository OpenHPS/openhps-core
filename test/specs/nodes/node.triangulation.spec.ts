import { expect } from 'chai';
import 'mocha';
import {
    LoggingSinkNode,
    ModelBuilder,
    ListSourceNode,
    DataFrame,
    DataObject,
    Absolute2DPosition,
    Absolute3DPosition,
    RelativeAngle,
    AngleUnit,
    TriangulationNode,
} from '../../../src';

/**
 * Run a frame through a model containing a single triangulation node.
 *
 * Assertions made inside a LoggingSinkNode callback are swallowed by the model, so the
 * frame is captured here and asserted on by the caller instead.
 * @param {DataFrame} frame Frame to push through the model
 * @returns {Promise<DataFrame>} Promise of the frame as it reached the sink
 */
function triangulateInModel(frame: DataFrame): Promise<DataFrame> {
    return new Promise((resolve, reject) => {
        let captured: DataFrame;
        ModelBuilder.create()
            .from(new ListSourceNode([frame]))
            .via(new TriangulationNode())
            .to(
                new LoggingSinkNode((f: DataFrame) => {
                    captured = f;
                }),
            )
            .build()
            .then((model) => Promise.resolve(model.pull()))
            .then(() => resolve(captured))
            .catch(reject);
    });
}

function beacon(uid: string, position: Absolute2DPosition | Absolute3DPosition): DataObject {
    const object = new DataObject(uid);
    object.setPosition(position);
    return object;
}

describe('node', () => {
    describe('triangulation', () => {
        it('should calculate a location based on three angles', async () => {
            const frame = new DataFrame();
            const b1 = beacon('b1', new Absolute2DPosition(1, 1));
            const b2 = beacon('b2', new Absolute2DPosition(1, 10));
            const b3 = beacon('b3', new Absolute2DPosition(10, 1));
            [b1, b2, b3].forEach((b) => frame.addObject(b));

            frame.source = new DataObject('phone');
            frame.source.addRelativePosition(new RelativeAngle(b1, 270, AngleUnit.DEGREE));
            frame.source.addRelativePosition(new RelativeAngle(b2, 90, AngleUnit.DEGREE));
            frame.source.addRelativePosition(new RelativeAngle(b3, 330, AngleUnit.DEGREE));

            const result = await triangulateInModel(frame);
            const position = result.source.getPosition() as Absolute2DPosition;
            expect(position).to.not.be.undefined;
            expect(position.x).to.be.gt(0.9);
            expect(position.x).to.be.lt(1.1);
        });

        it('should resolve instead of hanging when only two angles are known', async () => {
            const frame = new DataFrame();
            const b1 = beacon('b1', new Absolute2DPosition(1, 1));
            const b2 = beacon('b2', new Absolute2DPosition(1, 10));
            [b1, b2].forEach((b) => frame.addObject(b));

            const phone = new DataObject('phone');
            phone.addRelativePosition(new RelativeAngle(b1, 270, AngleUnit.DEGREE));
            phone.addRelativePosition(new RelativeAngle(b2, 90, AngleUnit.DEGREE));
            frame.source = phone;

            const node = new TriangulationNode();
            const relativePositions = new Map<RelativeAngle, DataObject>();
            relativePositions.set(phone.relativePositions[0] as RelativeAngle, b1);
            relativePositions.set(phone.relativePositions[1] as RelativeAngle, b2);

            const outcome = await Promise.race([
                node.processRelativePositions(phone, relativePositions, frame).then(() => 'settled'),
                new Promise((resolve) => setTimeout(() => resolve('pending'), 1000)),
            ]);
            expect(outcome).to.equal('settled');
        });

        it('should keep the altitude of the reference points instead of flattening to zero', async () => {
            const frame = new DataFrame();
            const b1 = beacon('b1', new Absolute3DPosition(1, 1, 12));
            const b2 = beacon('b2', new Absolute3DPosition(1, 10, 12));
            const b3 = beacon('b3', new Absolute3DPosition(10, 1, 12));
            [b1, b2, b3].forEach((b) => frame.addObject(b));

            frame.source = new DataObject('phone');
            frame.source.addRelativePosition(new RelativeAngle(b1, 270, AngleUnit.DEGREE));
            frame.source.addRelativePosition(new RelativeAngle(b2, 90, AngleUnit.DEGREE));
            frame.source.addRelativePosition(new RelativeAngle(b3, 330, AngleUnit.DEGREE));

            const result = await triangulateInModel(frame);
            const position = result.source.getPosition() as Absolute3DPosition;
            expect(position).to.not.be.undefined;
            // Azimuth-only angles cannot determine altitude; the plane of the reference
            // points is the best available estimate, and is certainly better than zero.
            expect(position.z).to.equal(12);
        });
    });
});

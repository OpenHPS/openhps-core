import { expect } from 'chai';
import 'mocha';
import { CallbackSinkNode, DataFrame, DataObject, ModelBuilder, WindowNode } from '../../../../src';

describe('node', () => {
    describe('window', () => {
        it('should close a window after a number of frames', async () => {
            const frames: DataFrame[] = [];
            const node = new WindowNode({ windowCount: 3 });
            const model = await ModelBuilder.create()
                .from()
                .via(node)
                .to(
                    new CallbackSinkNode((frame: DataFrame) => {
                        frames.push(frame);
                    }),
                )
                .build();

            await model.push(new DataFrame(new DataObject('a')));
            await model.push(new DataFrame(new DataObject('b')));
            expect(frames).to.have.length(0);

            await model.push(new DataFrame(new DataObject('c')));
            expect(frames).to.have.length(1);
            expect(frames[0].getObjects().map((object) => object.uid)).to.have.members(['a', 'b', 'c']);

            await model.push(new DataFrame(new DataObject('d')));
            await model.push(new DataFrame(new DataObject('e')));
            expect(frames).to.have.length(1);

            await node.flush();
            expect(frames).to.have.length(2);
            expect(frames[1].getObjects().map((object) => object.uid)).to.have.members(['d', 'e']);
        });

        it('should close a window after a duration of frames', async () => {
            const frames: DataFrame[] = [];
            const node = new WindowNode({ windowSize: 1000 });
            const model = await ModelBuilder.create()
                .from()
                .via(node)
                .to(
                    new CallbackSinkNode((frame: DataFrame) => {
                        frames.push(frame);
                    }),
                )
                .build();

            const push = (uid: string, timestamp: number): Promise<any> => {
                const frame = new DataFrame(new DataObject(uid));
                frame.phenomenonTimestamp = timestamp;
                return model.push(frame);
            };

            await push('a', 0);
            await push('b', 400);
            await push('c', 800);
            expect(frames).to.have.length(0);

            // 1200 ms after the first frame, so it starts the next window
            await push('d', 1200);
            expect(frames).to.have.length(1);
            expect(frames[0].getObjects().map((object) => object.uid)).to.have.members(['a', 'b', 'c']);

            await push('e', 1600);
            expect(frames).to.have.length(1);

            await node.flush();
            expect(frames).to.have.length(2);
            expect(frames[1].getObjects().map((object) => object.uid)).to.have.members(['d', 'e']);
        });

        it('should buffer frames of different groups independently', async () => {
            const frames: DataFrame[] = [];
            const node = new WindowNode({
                windowCount: 2,
                groupBy: (frame: DataFrame) => frame.source.uid,
            });
            const model = await ModelBuilder.create()
                .from()
                .via(node)
                .to(
                    new CallbackSinkNode((frame: DataFrame) => {
                        frames.push(frame);
                    }),
                )
                .build();

            const push = (source: string, object: string): Promise<any> => {
                const frame = new DataFrame(new DataObject(source));
                frame.addObject(new DataObject(object));
                return model.push(frame);
            };

            await push('a', 'a1');
            await push('b', 'b1');
            expect(frames).to.have.length(0);

            await push('a', 'a2');
            expect(frames).to.have.length(1);
            expect(frames[0].getObjects().map((object) => object.uid)).to.have.members(['a', 'a1', 'a2']);

            await push('b', 'b2');
            expect(frames).to.have.length(2);
            expect(frames[1].getObjects().map((object) => object.uid)).to.have.members(['b', 'b1', 'b2']);
        });

        it('should use a custom aggregation function', async () => {
            const frames: DataFrame[] = [];
            const node = new WindowNode({
                windowCount: 2,
                aggregate: (window: DataFrame[]) => {
                    const frame = new DataFrame(new DataObject('aggregated'));
                    frame.phenomenonTimestamp = window[window.length - 1].phenomenonTimestamp;
                    return frame;
                },
            });
            const model = await ModelBuilder.create()
                .from()
                .via(node)
                .to(
                    new CallbackSinkNode((frame: DataFrame) => {
                        frames.push(frame);
                    }),
                )
                .build();

            await model.push(new DataFrame(new DataObject('a')));
            expect(frames).to.have.length(0);
            await model.push(new DataFrame(new DataObject('b')));

            expect(frames).to.have.length(1);
            expect(frames[0].getObjects().map((object) => object.uid)).to.deep.equal(['aggregated']);
        });

        it('should discard open windows when reset', async () => {
            const frames: DataFrame[] = [];
            const node = new WindowNode({ windowCount: 3 });
            const model = await ModelBuilder.create()
                .from()
                .via(node)
                .to(
                    new CallbackSinkNode((frame: DataFrame) => {
                        frames.push(frame);
                    }),
                )
                .build();

            await model.push(new DataFrame(new DataObject('a')));
            await model.push(new DataFrame(new DataObject('b')));
            node.reset();

            await node.flush();
            expect(frames).to.have.length(0);
        });
    });
});

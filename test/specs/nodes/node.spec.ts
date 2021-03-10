import { expect } from 'chai';
import 'mocha';
import { CallbackNode, DataFrame, LoggingSinkNode } from '../../../src';

describe('node', () => {
    describe('uid', () => {
        it('should not be null', () => {
            const node = new LoggingSinkNode();
            expect(node.uid).to.not.equal(null);
        });

        it('should be changeablel', () => {
            const node = new LoggingSinkNode();
            node.uid = 'abc';
            expect(node.uid).to.equal('abc');
        });
    });

    describe('pull', () => {
        it('should trigger exception', (done) => {
            const node = new CallbackNode(
                (frame: DataFrame) => {},
                () => {
                    throw new Error('Error');
                },
            );
            Promise.resolve(node.pull())
                .then(() => {
                    done('No error triggered!');
                })
                .catch((_) => {
                    done();
                });
        });
    });

    describe('push', () => {
        it('should trigger exception', (done) => {
            const node = new CallbackNode(
                (frame: DataFrame) => {
                    throw new Error('Error');
                },
                () => {
                    return null;
                },
            );
            Promise.resolve(node.push(new DataFrame()))
                .then(() => {
                    done('No error triggered!');
                })
                .catch((_) => {
                    done();
                });
        });

        it('should be available when not busy', () => {
            const node = new CallbackNode(
                (frame: DataFrame) => {
                },
                () => {
                    return null;
                },
            ); 
            expect(node.isAvailable()).to.equal(true);
        });
    });

    describe('updating', () => {
        it('should support updating options', () => {
            const node = new LoggingSinkNode(() => undefined, {
                uid: "test"
            });
            node.setOptions({
                name: "abc"
            });
            expect(node.name).to.equal("abc");
        });
    });
});

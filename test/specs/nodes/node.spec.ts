import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode } from '../../../src/nodes/sink';
import { CallbackNode, DataFrame } from '../../../src';

describe('node', () => {
    describe('uid', () => {

        it('should not be null', () => {
            const node = new LoggingSinkNode();
            expect(node.uid).to.not.equal(null);
        });

        it('should be changeablel', () => {
            const node = new LoggingSinkNode();
            node.uid = "abc";
            expect(node.uid).to.equal("abc");
        });

    });

    describe('pull', () => {

        it('should trigger exception', (done) => {
            const node = new CallbackNode((frame: DataFrame) => {

            }, () => {
                throw new Error('Error');
            });
            Promise.resolve(node.pull()).then(() => {
                done('No error triggered!');
            }).catch(_ => {
                done();
            });
        });

    });

    describe('push', () => {

        it('should trigger exception', (done) => {
            const node = new CallbackNode((frame: DataFrame) => {
                throw new Error('Error');
            }, () => {
                return null;
            });
            Promise.resolve(node.push(new DataFrame())).then(() => {
                done('No error triggered!');
            }).catch(_ => {
                done();
            });
        });

    });

});
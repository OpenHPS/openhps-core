import { expect } from 'chai';
import 'mocha';
import { LoggingSinkNode } from '../../src/nodes/sink';

describe('node', () => {
    describe('uid', () => {
        it('should not be null', () => {
            const node = new LoggingSinkNode();
            expect(node.getUID()).to.not.equal(null);
        });
    });
});
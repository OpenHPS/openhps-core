import { expect } from 'chai';
import 'mocha';
import {v4 as uuidv4} from 'uuid';
import { UUID } from '../../../src';

describe('UUID', () => {

    describe('fromString()', () => {
        it('should take uuidv4', () => {
            const uuidStr = uuidv4();
            const uuid = UUID.fromString(uuidStr);
            expect(uuid.toString()).to.eql(uuidStr);
        });

        it('should not accept non-uuids', () => {
            const uuidStr = "Maxim Van de Wynckel";
            const uuid = UUID.fromString(uuidStr);
            expect(uuid).to.eql(undefined);
        });
    });

});

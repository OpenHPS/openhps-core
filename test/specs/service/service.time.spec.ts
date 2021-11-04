import 'mocha';
import { TimeService } from '../../../src';
import { expect } from 'chai';

describe('time service', () => {
    describe('should support microtime', () => {
        TimeService.initialize();
        expect(TimeService.now()).to.not.be.undefined;
        expect(TimeService.now()).to.not.equal(TimeService.now());
        const timeService = new TimeService();
        expect(TimeService.now()).to.be.gt(Date.now());
        expect(timeService.getTime()).to.not.equal(timeService.getTime());
        expect(TimeService.now()).to.not.be.undefined;
    });
});

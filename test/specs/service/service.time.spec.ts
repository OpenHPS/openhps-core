import 'mocha';
import { DataFrameService, Model, DataFrame, ModelBuilder, LoggingSinkNode, DataObject, TimeService } from '../../../src';
import { expect } from 'chai';

describe('time service', () => {
    describe('should support microtime', () => {
        TimeService.initialize();
        console.log(TimeService.now())
        console.log(TimeService.now())
        expect(TimeService.now()).to.not.be.undefined;
    });
});

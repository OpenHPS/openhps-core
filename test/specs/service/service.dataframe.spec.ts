import {
    DataFrame,
    DataObject,
    Absolute2DPosition,
    Absolute3DPosition,
    MemoryDataService,
    DataFrameService,
} from '../../../src';
import { expect } from 'chai';
import 'mocha';

describe('DataFrameService', () => {
    let dataService: DataFrameService<DataFrame>;

    before((done) => {
        dataService = new DataFrameService(new MemoryDataService(DataFrame));
        const object1 = new DataObject('m_1');
        object1.setPosition(new Absolute2DPosition(5, 6));
        object1.displayName = 'Test';
        object1.createdTimestamp = Date.parse('10 Mar 1995 00:00:00 GMT');

        const object2 = new DataObject('m_2');
        object2.setPosition(new Absolute3DPosition(5, 6, 2));
        object2.displayName = 'Test';
        object2.parentUID = object1.uid;
        object2.createdTimestamp = Date.parse('10 Mar 1995 01:00:00 GMT');

        const object3 = new DataObject('m_3');
        object3.setPosition(new Absolute3DPosition(1, 1, 2));
        object3.displayName = 'Maxim';
        object3.createdTimestamp = Date.parse('10 Mar 1995 02:00:00 GMT');

        const insertPromises = [];
        insertPromises.push(dataService.insertFrame(new DataFrame(object1)));
        insertPromises.push(dataService.insertFrame(new DataFrame(object1)));
        insertPromises.push(dataService.insertFrame(new DataFrame(object2)));
        insertPromises.push(dataService.insertFrame(new DataFrame(object3)));

        Promise.all(insertPromises)
            .then(() => {
                done();
            })
            .catch((ex) => {
                done(ex);
            });
    });

    it('should support finding frames by object', (done) => {
        dataService
            .findByDataObject('m_1')
            .then((frames) => {
                expect(frames.length).to.equal(2);
                done();
            })
            .catch((ex) => {
                done(ex);
            });
    });
});

import 'mocha';
import { FilterQuery, DataObject, QueryEvaluator, Absolute2DPosition, DataFrame } from '../../../src';
import { expect } from 'chai';
import { DummyDataObject } from '../../mock/data/object/DummyDataObject';

describe('query', () => {
    describe('syntax', () => {
        it('should support explicit classes', () => {
            const query: FilterQuery<DataObject> = {
                displayName: 'Maxim',
            };
        });

        it('should support extended classes', () => {
            const query: FilterQuery<DummyDataObject> = {
                displayName: 'Maxim',
            };
        });
    });

    describe('evaluator', () => {
        it('should evaluate single keys', () => {
            const object1 = new DataObject('mvdewync', 'Maxim');
            const object2 = new DataObject('bsigner', 'Beat');
            const query: FilterQuery<DataObject> = {
                displayName: 'Maxim',
            };
            expect(QueryEvaluator.evaluate(object1, query)).to.be.true;
            expect(QueryEvaluator.evaluate(object2, query)).to.be.false;
        });

        it('should evaluate multiple keys', () => {
            const object1 = new DataObject('mvdewync', 'Maxim');
            object1.parentUID = 'abc';
            const object2 = new DataObject('bsigner', 'Beat');
            object2.parentUID = 'abc';
            const query: FilterQuery<DataObject> = {
                displayName: 'Maxim',
                parentUID: 'abc',
            };
            expect(QueryEvaluator.evaluate(object1, query)).to.be.true;
            expect(QueryEvaluator.evaluate(object2, query)).to.be.false;

            object1.parentUID = 'cba';
            expect(QueryEvaluator.evaluate(object1, query)).to.be.false;
        });

        it('should evaluate $and', () => {
            const object1 = new DataObject('mvdewync', 'Maxim');
            const object2 = new DataObject('bsigner', 'Beat');
            const object3 = new DataObject('mvdewync2', 'Maxim');
            const query: FilterQuery<DataObject> = {
                $and: [{ displayName: 'Maxim' }, { uid: 'mvdewync' }],
            };
            expect(QueryEvaluator.evaluate(object1, query)).to.be.true;
            expect(QueryEvaluator.evaluate(object2, query)).to.be.false;
            expect(QueryEvaluator.evaluate(object3, query)).to.be.false;
        });

        it('should evaluate $or', () => {
            const object1 = new DataObject('mvdewync', 'Maxim');
            const object2 = new DataObject('bsigner', 'Beat');
            const object3 = new DataObject('mvdewync2', 'Maxim');
            const query: FilterQuery<DataObject> = {
                $or: [{ uid: 'mvdewync2' }, { uid: 'bsigner' }],
            };
            expect(QueryEvaluator.evaluate(object1, query)).to.be.false;
            expect(QueryEvaluator.evaluate(object2, query)).to.be.true;
            expect(QueryEvaluator.evaluate(object3, query)).to.be.true;
        });

        it('should evaluate nested keys', () => {
            const object1 = new DataObject('mvdewync', 'Maxim');
            object1.setPosition(new Absolute2DPosition(3, 5));
            const object2 = new DataObject('bsigner', 'Beat');
            const query: FilterQuery<DataObject> = {
                'position.x': 3,
            };
            expect(QueryEvaluator.evaluate(object1, query)).to.be.true;
            expect(QueryEvaluator.evaluate(object2, query)).to.be.false;
        });

        it('should evaluate regular expressions', () => {
            const object1 = new DataObject('mvdewync', 'Maxim');
            const object2 = new DataObject('bsigner', 'Beat');
            const query: FilterQuery<DataObject> = {
                uid: /wync/g,
            };
            expect(QueryEvaluator.evaluate(object1, query)).to.be.true;
            expect(QueryEvaluator.evaluate(object2, query)).to.be.false;
        });

        describe('comparison', () => {
            it('should evaluate $gt', () => {
                const object1 = new DataObject('mvdewync', 'Maxim');
                object1.createdTimestamp = 1;
                const object2 = new DataObject('bsigner', 'Beat');
                object2.createdTimestamp = 10;
                const object3 = new DataObject('mvdewync2', 'Maxim');
                object3.createdTimestamp = 20;
                const query: FilterQuery<DataObject> = {
                    createdTimestamp: {
                        $gt: 10,
                    },
                };
                expect(QueryEvaluator.evaluate(object1, query)).to.be.false;
                expect(QueryEvaluator.evaluate(object2, query)).to.be.false;
                expect(QueryEvaluator.evaluate(object3, query)).to.be.true;
            });

            it('should evaluate $gte', () => {
                const object1 = new DataObject('mvdewync', 'Maxim');
                object1.createdTimestamp = 1;
                const object2 = new DataObject('bsigner', 'Beat');
                object2.createdTimestamp = 10;
                const object3 = new DataObject('mvdewync2', 'Maxim');
                object3.createdTimestamp = 20;
                const query: FilterQuery<DataObject> = {
                    createdTimestamp: {
                        $gte: 10,
                    },
                };
                expect(QueryEvaluator.evaluate(object1, query)).to.be.false;
                expect(QueryEvaluator.evaluate(object2, query)).to.be.true;
                expect(QueryEvaluator.evaluate(object3, query)).to.be.true;
            });

            it('should evaluate $lt', () => {
                const object1 = new DataObject('mvdewync', 'Maxim');
                object1.createdTimestamp = 1;
                const object2 = new DataObject('bsigner', 'Beat');
                object2.createdTimestamp = 10;
                const object3 = new DataObject('mvdewync2', 'Maxim');
                object3.createdTimestamp = 20;
                const query: FilterQuery<DataObject> = {
                    createdTimestamp: {
                        $lt: 10,
                    },
                };
                expect(QueryEvaluator.evaluate(object1, query)).to.be.true;
                expect(QueryEvaluator.evaluate(object2, query)).to.be.false;
                expect(QueryEvaluator.evaluate(object3, query)).to.be.false;
            });

            it('should evaluate $lte', () => {
                const object1 = new DataObject('mvdewync', 'Maxim');
                object1.createdTimestamp = 1;
                const object2 = new DataObject('bsigner', 'Beat');
                object2.createdTimestamp = 10;
                const object3 = new DataObject('mvdewync2', 'Maxim');
                object3.createdTimestamp = 20;
                const query: FilterQuery<DataObject> = {
                    createdTimestamp: {
                        $lte: 10,
                    },
                };
                expect(QueryEvaluator.evaluate(object1, query)).to.be.true;
                expect(QueryEvaluator.evaluate(object2, query)).to.be.true;
                expect(QueryEvaluator.evaluate(object3, query)).to.be.false;
            });
        });

        describe('array query', () => {
            it('should evaluate $elemMatch', () => {
                const object1 = new DataObject('mvdewync', 'Maxim');
                const object2 = new DataObject('bsigner', 'Beat');
                const object3 = new DataObject('mvdewync2', 'Maxim');
                const frame1 = new DataFrame();
                frame1.addObject(object1);
                frame1.addObject(object2);
                frame1.addObject(object3);
                const frame2 = new DataFrame();
                frame2.addObject(object3);
                const frame3 = new DataFrame();
                frame3.addObject(object1);

                const query: FilterQuery<DataFrame> = {
                    _objects: {
                        $elemMatch: {
                            uid: 'mvdewync',
                        },
                    },
                };
                expect(QueryEvaluator.evaluate(frame1, query)).to.be.true;
                expect(QueryEvaluator.evaluate(frame2, query)).to.be.false;
                expect(QueryEvaluator.evaluate(frame3, query)).to.be.true;
            });
        });
    });
});

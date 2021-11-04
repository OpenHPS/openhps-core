import { expect } from 'chai';
import 'mocha';
import { CallbackNode, DataFrame, LoggingSinkNode, Node, Service, SourceNode } from '../../../src';

describe('Node', () => {
    describe('uid', () => {
        it('should not be null', () => {
            const node = new LoggingSinkNode();
            expect(node.uid).to.not.equal(null);
        });

        it('should be changeable', () => {
            const node = new LoggingSinkNode();
            node.uid = 'abc';
            expect(node.uid).to.equal('abc');
        });
    });

    describe('serialization', () => {
        it('should return all subclasses', () => {
            const nodes: Array<new () => Node<any, any>> = [];
            const services: Array<new () => Service> = [];
            module.children.forEach((module) => {
                Object.keys(module.exports).forEach((key) => {
                    if (module.exports[key].prototype instanceof Node) {
                        nodes.push(module.exports[key]);
                    } else if (module.exports[key].prototype instanceof Service) {
                        services.push(module.exports[key]);
                    }
                });
            });
            // console.log(nodes);
            // console.log(services);
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
        it('should not accept null frames', (done) => {
            const node = new CallbackNode(
                (frame: DataFrame) => {},
                () => {
                    return null;
                },
            );
            Promise.resolve(node.push(null))
                .then(() => {
                    done('No error triggered!');
                })
                .catch((_) => {
                    done();
                });
        });

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
                (frame: DataFrame) => {},
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
                uid: 'test',
            });
            node.setOptions({
                name: 'abc',
            });
            expect(node.getOptions().name).to.equal('abc');
            expect(node.name).to.equal('abc');
        });
    });
});

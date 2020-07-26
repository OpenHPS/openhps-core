import 'matcha';
import { DataFrame, DataObject, Absolute3DPosition, ReferenceSpace, DataSerializer } from '../../src';

suite('DataFrame', () => {

    set('iterations', 100);     // the number of times to run a given bench
    set('concurrency', 1);      // the number of how many times a given bench is run concurrently
    set('type', 'adaptive');    // or 'static' (see below)
    set('mintime', 500);        // when adaptive, the minimum time in ms a bench should run
    set('delay', 100);          // time in ms between each bench

    bench('serialization', () => {
        const source = new DataObject();
        source.setPosition(new Absolute3DPosition(10, 5, 4));
        const dataFrame = new DataFrame(source);
        dataFrame.addReferenceSpace(new ReferenceSpace(undefined)
            .translation(5, 1, 2));
        DataSerializer.serialize(dataFrame);
    });
    
});

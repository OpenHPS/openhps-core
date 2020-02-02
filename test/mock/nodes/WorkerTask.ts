import { expose } from 'threads';
import { DataFrame } from '../../../src';

expose({
    process(data: DataFrame, options) {
        console.log(data)
        return data;
    }
});
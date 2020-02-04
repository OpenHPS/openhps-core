import { expose } from 'threads';
import { DataFrame } from '../../../src';

expose({
    process(data: DataFrame, options) {
        return data;
    }
});
import { DataService } from './DataService';
import { Constructor } from '../data/decorators';

export class DummyDataService<I, T> extends DataService<I, T> {
    private _dataType: Constructor<T>;

    constructor(uid: string, dataType: Constructor<T>) {
        super(undefined);
        this.uid = uid;
        this._dataType = dataType;
    }

    get dataType(): Constructor<T> {
        return this._dataType;
    }
}

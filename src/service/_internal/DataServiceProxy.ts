import { ServiceProxy } from './ServiceProxy';
import { DataService } from '../DataService';

export class DataServiceProxy<I, T, S extends DataService<I, T>> extends ServiceProxy<S> {
    get?(target: S, p: PropertyKey): any {
        if (p === 'dataType') {
            return target.dataType;
        }
        return super.get(target, p);
    }
}

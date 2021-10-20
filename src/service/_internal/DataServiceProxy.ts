import { ServiceProxy } from './ServiceProxy';
import { DataService } from '../DataService';

export class DataServiceProxy<I, T, S extends DataService<I, T>> extends ServiceProxy<S> {}

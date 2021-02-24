import { ServiceProxy } from './ServiceProxy';
import { DataServiceDriver } from '../DataServiceDriver';

export class DataServiceProxy<I, T, S extends DataServiceDriver<I, T>> extends ServiceProxy<S> {}

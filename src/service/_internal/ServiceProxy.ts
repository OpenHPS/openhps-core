import { Service } from '../Service';

export class ServiceProxy<S extends Service> extends Service implements ProxyHandler<S> {
    get?(target: S, p: PropertyKey): any {
        if (p === 'target') {
            return target;
        } else if (p === 'constructor') {
            return target.constructor;
        } else if (typeof (target as any)[p] === 'function') {
            return this.createHandler(target, p);
        }
        return (target as any)[p];
    }

    set?(target: S, p: PropertyKey, value: any): boolean {
        (target as any)[p] = value;
        return true;
    }

    createHandler(target: S, p: PropertyKey): (...args: any[]) => any {
        const key = p as string;
        return (...args: any[]) => {
            if (key !== 'emit' && key !== 'emitAsync' && key !== 'on' && key !== 'once') {
                target.emit(key, ...args);
            }
            return (target as any)[p](...args);
        };
    }
}

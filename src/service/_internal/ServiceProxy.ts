import { Service } from "../Service";
import { isFunction } from "util";

export class ServiceProxy<S extends Service> implements ProxyHandler<S> {
    
    public get? (target: S, p: PropertyKey, receiver: any): any {
        if (isFunction((target as any)[p])) {
            target.emit(p as string);
        }
        return (target as any)[p];
    }
    
    public set? (target: S, p: PropertyKey, value: any, receiver: any): boolean {
        (target as any)[p] = value;
        return true;
    }

}

import { Service } from "../Service";

export class ServiceProxy<S extends Service> extends Service implements ProxyHandler<S> {
    
    public get? (target: S, p: PropertyKey, receiver: any): any {
        if (typeof ((target as any)[p]) === "function") {
            return this.createHandler(target, p);
        }
        return (target as any)[p];
    }
    
    public set? (target: S, p: PropertyKey, value: any, receiver: any): boolean {
        (target as any)[p] = value;
        return true;
    }

    public createHandler(target: S, p: PropertyKey): (...args: any[]) => any {
        return (...args: any[]) => {
            const key = p as string;     
            if (key !== "emit" && 
                key !== "emitAsync" && 
                key !== "on" && 
                key !== "once") {
                target.emit(key, ...args);
            }
            return (target as any)[p](...args);
        };
    }
    
}

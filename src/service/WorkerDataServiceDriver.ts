import { DataServiceDriver } from "./DataServiceDriver";

export class WorkerDataServiceDriver<I, T> extends DataServiceDriver<I, T> {

    public findOne(filter: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            
        });
    }
    
    public findById(id: I): Promise<T> {
        return new Promise<T>((resolve, reject) => {
           
        });
    }

    public findAll(filter?: any): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            
        });
    }

    public insert(id: I, object: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            
        });
    }

    public delete(id: I): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            
        });
    }

    public deleteAll(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            
        });
    }
}

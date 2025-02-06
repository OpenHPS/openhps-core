import { DataFrame } from "../data";


/**
 * A push promise is a promise that is returned when pushing a dataframe to a graph.
 */
export class PushPromise<T, F extends DataFrame = DataFrame> extends Promise<T> {
    protected executor: (
        resolve: (value?: T | PromiseLike<T>) => void, 
        reject: (reason?: any) => void, 
        complete?: (value?: F | PromiseLike<F>) => void) => void; 
    protected oncompleted?: (() => void);

    constructor(executor: (
        resolve: (value?: T | PromiseLike<T>) => void, 
        reject: (reason?: any) => void, 
        complete?: (value?: F | PromiseLike<F>) => void) => void) {
        super(executor);
    }

    completed(oncompleted?: (() => void)): PushPromise<T> {
        this.oncompleted = oncompleted;
        return this;
    }
}

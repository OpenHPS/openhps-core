import { resolve } from 'path';

/**
 * A push promise is a promise that is returned when pushing a dataframe to a graph.
 */
export class PushPromise<T, F = any> extends Promise<T> {
    protected oncompleted?: () => void;

    constructor(
        executor: (
            resolve: (value?: T | PromiseLike<T>) => void,
            reject: (reason?: any) => void,
            complete?: (value?: F | PromiseLike<F>) => void,
        ) => void,
    ) {
        super((resolve, reject) => {
            // Handle promise resolution or rejection and call `complete`
            executor(resolve, reject, () => {
                // This will be invoked by the custom "complete" handler
                if (this.oncompleted) {
                    this.oncompleted();
                }
            });
        });
    }

    completed(oncompleted?: () => void): PushPromise<T> {
        this.oncompleted = oncompleted;
        return this;
    }
}

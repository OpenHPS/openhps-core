import { OutputLayer } from "./OutputLayer";
import { DataFrame } from "../../data";
import { DataOptions } from "../DataOptions";

export class LoggerOutputLayer<T extends DataFrame> extends OutputLayer<T> {
    private _loggingFn: (log: string) => {};

    constructor(loggingFn: (log: string) => {}) {
        super();
        this._loggingFn = loggingFn;
    }
    
    /**
     * Process the data that was pushed or pulled from this layer
     * @param data Data frame
     * @param options Push/Pull options
     */
    public process(data: T, options: DataOptions): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            super.process(data, options).then(result => {
                this._loggingFn(data.toString());
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

}

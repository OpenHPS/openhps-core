import { OutputLayer } from "./OutputLayer";
import { DataFrame } from "../../data";

export class LoggerOutputLayer<T extends DataFrame> extends OutputLayer<T> {
    private _loggingFn: (log: string) => {};

    constructor(loggingFn: (log: string) => {}) {
        super();
        this._loggingFn = loggingFn;
    }
    
}

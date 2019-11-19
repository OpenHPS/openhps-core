import { OutputLayer } from "./OutputLayer";
import { DataFrame } from "../../data";

export class LoggerOutputLayer<T extends DataFrame> extends OutputLayer<T> {
    private _loggingFn: (log: string) => {};

    constructor(name: string = "logger", loggingFn: (log: string) => {}) {
        super(name);
        this._loggingFn = loggingFn;
    }

    
}
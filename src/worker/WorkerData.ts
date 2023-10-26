export interface SerializedWorkerMethod {
    name: string;
    handlerFn: string;
}

export interface WorkerData {
    services?: Array<{
        uid: string;
        dataType?: string;
    }>;
    builder?: string;
    serialized?: any;
    shape?: string;
    imports?: string[];
    directory?: string;
    args?: any;
    type?: string;
    methods?: SerializedWorkerMethod[];
}

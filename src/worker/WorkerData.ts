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
}

export interface WorkerData {
    services?: Array<{
        uid: string;
        dataType?: string;
    }>;
    builder?: string;
    shape?: string;
    imports?: string[];
    directory?: string;
    args?: any;
}

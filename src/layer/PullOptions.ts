/**
 * # OpenHPS: Pull options
 */
export class PullOptions {
    public static DEFAULT = new PullOptions();
    oid: string;
    process: boolean = true;
    batchSize: number = 1;
}
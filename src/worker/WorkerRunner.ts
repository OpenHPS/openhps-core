import 'reflect-metadata';
import { DataFrame, WorkerServiceCall, WorkerServiceResponse, PullOptions, PushOptions } from '..'; // @openhps/core
import { Observable } from 'threads/observable';
import { expose } from 'threads';
import { WorkerBase } from './WorkerBase';
import { WorkerData } from './WorkerData';

const worker: WorkerBase = new WorkerBase();
expose({
    /**
     * Worker initialization
     * @param {WorkerData} config Worker data containing model information
     * @returns {Promise<void>} Initialize promise
     */
    init(config: WorkerData): Promise<void> {
        return worker.init(config);
    },
    /**
     * Pull from this work
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    pull(options?: PullOptions): Promise<void> {
        return worker.pull(options);
    },
    /**
     * Push to this worker
     * @param {DataFrame} frame Data frame
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    push(frame: DataFrame, options?: PushOptions): Promise<void> {
        return worker.push(frame, options);
    },
    /**
     * Input observable for pull requests
     * @returns {Observable<void>} Observable input
     */
    pullOutput(): Observable<void> {
        return Observable.from(worker.pullOutput);
    },
    /**
     * Output observable for push events
     * @returns {Observable<any>} Observable output
     */
    pushOutput(): Observable<any> {
        return Observable.from(worker.pushOutput);
    },
    eventOutput(): Observable<{
        name: string;
        event: any;
    }> {
        return Observable.from(worker.eventOutput);
    },
    eventInput(name: string, event: any): void {
        worker.model.emit(name as any, event);
    },
    /**
     * Outgoing call to a service on the main thread
     * @returns {Observable<WorkerServiceCall>} Observable of outgoing service calls
     */
    serviceOutputCall(): Observable<WorkerServiceCall> {
        return Observable.from(worker.serviceOutputCall);
    },
    /**
     * Response to an outgoing service call from the main thread
     * @param {WorkerServiceResponse} input Service response
     */
    serviceOutputResponse(input: WorkerServiceResponse) {
        worker.serviceOutputResponse.next(input);
    },
    serviceInputCall(call: WorkerServiceCall): Promise<WorkerServiceResponse> {
        return worker.callService(call);
    },
    findAllServices(): Promise<any[]> {
        return worker.findAllServices();
    },
});

export default worker;

import { PullOptions, PushOptions } from './interfaces';
import { DataFrame } from '../data';
import { Node } from '../Node';
import { PushCompletedEvent, PushError } from './events';
import { Inlet } from './Inlet';
import { Outlet } from './Outlet';

export class Edge<InOut extends DataFrame> implements Inlet, Outlet<InOut> {
    public inputNode: Node<any, InOut>;
    public outputNode: Node<InOut, any>;

    /**
     * Push data to the output node
     *
     * @param {DataFrame | DataFrame[]} data Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    public push(data: InOut | InOut[], options: PushOptions = {}): Promise<void> {
        return new Promise((resolve) => {
            const newOptions: PushOptions = {
                ...options,
                lastNode: this.inputNode.uid,
            };
            this.outputNode
                .push(data, newOptions)
                .then(() => {
                    resolve();
                })
                .catch((ex) => {
                    if (Array.isArray(data)) {
                        data.forEach((frame) => {
                            this.inputNode.emit('error', new PushError(frame.uid, this.outputNode.uid, ex));
                        });
                    } else {
                        this.inputNode.emit('error', new PushError(data.uid, this.outputNode.uid, ex));
                    }
                });
        });
    }

    /**
     * Pull data from the input node
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    public pull(options?: PullOptions): Promise<void> {
        return this.inputNode.pull(options);
    }

    public emit(name: 'completed', event: PushCompletedEvent): boolean;
    public emit(name: 'error', event: PushError): boolean;
    public emit(name: string, event: any): boolean {
        return this.inputNode.emit(name, event);
    }
}

import { PullOptions, PushOptions } from './interfaces';
import { DataFrame } from '../data';
import { Node } from '../Node';

export class Edge<InOut extends DataFrame> {
    public inputNode: Node<any, InOut>;
    public outputNode: Node<InOut, any>;

    /**
     * Push data to the output node
     *
     * @param {DataFrame | DataFrame[]} data Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    public push(data: InOut | InOut[], options?: PushOptions): Promise<void> {
        return new Promise((resolve) => {
            this.outputNode
                .push(data, options)
                .then(() => {
                    resolve();
                })
                .catch((ex) => {
                    if (Array.isArray(data)) {
                        data.forEach((frame) => {
                            this.inputNode.emit('error', {
                                frameUID: frame.uid,
                                error: ex,
                            });
                        });
                    } else {
                        this.inputNode.emit('error', {
                            frameUID: data.uid,
                            error: ex,
                        });
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
}

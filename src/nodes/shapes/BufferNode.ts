import { DataFrame } from '../../data/DataFrame';
import { GraphOptions, PullOptions } from '../../graph/options';
import { Node, NodeOptions } from '../../Node';
import { DataFrameService } from '../../service';

/**
 * @category Flow shape
 */
export class BufferNode<InOut extends DataFrame> extends Node<InOut, InOut> {
    protected service: DataFrameService<InOut>;
    protected options: BufferOptions;

    constructor(options?: BufferOptions) {
        super(options);
        this.on('pull', this.onPull.bind(this));
        this.on('push', this.onPush.bind(this));
        this.on('build', this._initService.bind(this));
    }

    private _initService(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.service) {
                this.service = (this.model.findDataService(
                    this.options.service || DataFrame,
                ) as unknown) as DataFrameService<InOut>;
            }
            resolve();
        });
    }

    public onPull(options?: PullOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            this.shift()
                .then((frame) => {
                    if (frame) {
                        this.outlets.forEach((outlet) => outlet.push(frame, options as GraphOptions));
                    }
                    resolve();
                })
                .catch(reject);
        });
    }

    public onPush(frame: InOut): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.service
                .insertFrame(frame)
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    protected next(): Promise<InOut> {
        return new Promise((resolve, reject) => {
            this.service
                .findOne(
                    {},
                    {
                        sort: [['createdTimestamp', 1]],
                    },
                )
                .then(resolve)
                .catch(reject);
        });
    }

    protected shift(): Promise<InOut> {
        return new Promise((resolve, reject) => {
            let result: InOut;
            this.next()
                .then((frame: InOut) => {
                    if (frame) {
                        result = frame;
                        return this.service.delete(frame.uid);
                    } else {
                        resolve(undefined);
                    }
                })
                .then(() => resolve(result))
                .catch(reject);
        });
    }
}

export interface BufferOptions extends NodeOptions {
    service?: string;
}

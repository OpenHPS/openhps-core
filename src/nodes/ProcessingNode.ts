import { DataFrame } from "../data";
import { Node } from "../Node";
import { GraphPushOptions } from "../graph/GraphPushOptions";

export abstract class ProcessingNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {

    constructor() {
        super();

        this.on('push', this._onPush.bind(this));
    }

    private _onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.process(data, options).then(result => {
                if (result !== null && result !== undefined) {
                    const promises = new Array();
                    this.outputNodes.forEach(node => {
                        promises.push(node.push(result, options));
                    });
                    Promise.all(promises).then(_ => {
                        resolve();
                    }).catch(ex => {
                        reject(ex);
                    });
                } else {
                    resolve();
                }
            }).catch(ex => {
                if (ex === undefined) {
                    this.logger("warning", {
                        message: `Exception thrown in processing node ${this.uid} but no exception given!`
                    });
                }
                reject(ex);
            });
        });
    }

    public abstract process(data: In, options: GraphPushOptions): Promise<Out>;
}

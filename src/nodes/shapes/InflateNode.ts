import { DataFrame, DataSerializer } from "../../data";
import * as zlib from 'zlib';
import { Node } from "../../Node";

export class InflateNode<InOut extends DataFrame> extends Node<InOut, any> {

    constructor() {
        super();

        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: InOut): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            zlib.inflate(DataSerializer.serialize(frame), (error: Error | null, result: Buffer) => {
                const pushPromises = new Array();
                this.outlets.forEach(outlet => {
                    pushPromises.push(outlet.push(result));
                });
                Promise.all(pushPromises).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            });
        });
    }

}

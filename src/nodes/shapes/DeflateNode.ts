import { DataFrame, DataSerializer } from "../../data";
import * as zlib from 'zlib';
import { Node } from "../../Node";

export class DeflateNode<InOut extends DataFrame> extends Node<any, InOut> {

    constructor() {
        super();

        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            zlib.deflate(DataSerializer.deserialize(frame), (error: Error | null, result: any) => {
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

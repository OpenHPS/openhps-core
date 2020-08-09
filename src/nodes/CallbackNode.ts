import { DataFrame } from "../data/DataFrame";
import { Node } from "../Node";

export class CallbackNode<InOut extends DataFrame | DataFrame[] = DataFrame> extends Node<InOut, InOut> {
    private _pushCallback: (frame: InOut) => void;
    private _pullCallback: () => InOut;

    constructor(pushCallback: (frame: InOut) => void = (frame: InOut) => { }, pullCallback: () => InOut = () => null) {
        super();
        this.pushCallback = pushCallback;
        this.pullCallback = pullCallback;

        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));
    }
    
    public get pullCallback(): () => InOut {
        return this._pullCallback;
    }

    public set pullCallback(pullCallback: () => InOut) {
        this._pullCallback = pullCallback;
    }

    public get pushCallback(): (frame: InOut) => void {
        return this._pushCallback;
    }

    public set pushCallback(pushCallback: (frame: InOut) => void) {
        this._pushCallback = pushCallback;
    }

    private _onPush(frame: InOut): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.pushCallback(frame);
            } catch (ex) {
                return reject(ex);
            }

            const pushPromises = new Array();
            this.outputNodes.forEach(node => {
                pushPromises.push(node.push(frame));
            });

            Promise.all(pushPromises).then(() => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onPull(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let result: InOut = null;
            try {
                result = this.pullCallback();
            } catch (ex) {
                return reject(ex);
            }
            
            if (result !== undefined && result !== null) {
                const pushPromises = new Array();
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(result));
                });
    
                Promise.all(pushPromises).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                resolve();
            }
        });
    }
    
} 

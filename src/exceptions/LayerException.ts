import { Layer } from "../layer";

export class LayerException extends Error {
    private _layer: Layer<any, any>;

    constructor(layer: Layer<any, any>, message: string) {
        super(message);
        this._layer = layer;
    }
}

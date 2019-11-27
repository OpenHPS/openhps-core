import { SourceLayer } from "./SourceLayer";
import { DataFrame } from "../../data";
import { PullOptions } from "../DataOptions";

/**
 * Source layer that uses a list of data frames as the source.
 */
export class ListSourceLayer<Out extends DataFrame> extends SourceLayer<Out> {
    private _inputData: Out[];

    constructor(inputData: Out[]) {
        super();
        this._inputData = inputData;
    }

    /**
     * Pull the data from the input 
     * @param options Pull options
     */
    public pull(options: PullOptions): Promise<Out> {
        return new Promise<Out>((resolve, reject) => {
            if (this._inputData.length !== 0) {
                resolve(this._inputData.pop());
            } else {
                resolve(null);
            }
        });
    }

}

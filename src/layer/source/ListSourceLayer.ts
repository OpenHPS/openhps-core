import { SourceLayer } from "./SourceLayer";
import { DataFrame } from "../../data";
import { PullOptions } from "../DataOptions";

export class ListSourceLayer<T extends DataFrame> extends SourceLayer<T> {
    private _inputData: T[];

    constructor(inputData: T[]) {
        super();
    }

    /**
     * Pull the data from the input 
     * @param options Pull options
     */
    public pull(options: PullOptions): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this._inputData.length !== 0) {
                resolve(this._inputData.pop());
            } else {
                resolve(null);
            }
        });
    }

}

import { InputLayer } from "./InputLayer";
import { DataFrame } from "../../data";
import { PullOptions } from "../PullOptions";

export class ListInputLayer<T extends DataFrame> extends InputLayer<T> {
    private _inputData: T[];

    constructor(name: string = "list-input", inputData: T[]) {
        super(name);
        this._inputData = inputData;
    }

    /**
     * Pull the data from the input 
     * @param options Pull options
     */
    public pull(options: PullOptions): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            resolve(this._inputData.pop());
        });
    }

}

import { DataFrame } from "../../data";
import { ProcessingNode } from "../ProcessingNode";

export class FrameFilterNode<InOut extends DataFrame> extends ProcessingNode<InOut, InOut> {
    private _filterFn: (frame: InOut) => boolean;

    constructor(filterFn: (frame: InOut) => boolean) {
        super();
        this._filterFn = filterFn;
    }

    public process(frame: InOut): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
           if (this._filterFn(frame)) {
               resolve(frame);
           } else {
               resolve();
           }
        });
    }

}

import { AbsolutePosition, DataObject, RelativeDistance } from '../../data';
import { DataFrame } from '../../data/DataFrame';
import { ObjectProcessingNodeOptions } from '../ObjectProcessingNode';
import { RelativePositionProcessing } from './RelativePositionProcessing';

/**
 * Cell identification processing node
 * @category Processing node
 */
export class CellIdentificationNode<InOut extends DataFrame> extends RelativePositionProcessing<
    InOut,
    RelativeDistance
> {
    protected options: CellIdentificationOptions;

    constructor(options?: CellIdentificationOptions) {
        super(RelativeDistance, options);
        this.options.maxDistance = this.options.maxDistance || 2;
    }

    public processRelativePositions<P extends AbsolutePosition>(
        dataObject: DataObject,
        relativePositions: Map<RelativeDistance, DataObject>,
        dataFrame: DataFrame,
    ): Promise<DataObject> {
        return new Promise((resolve) => {
            let spheres: Array<[P, number]> = [];
            relativePositions.forEach((object, relativePosition) => {
                if (object.getPosition()) {
                    spheres.push([object.getPosition() as P, relativePosition.distance]);
                }
            });

            // Order points and distances by distances
            spheres = spheres.sort((a, b) => a[1] - b[1]);
            if (spheres.length > 0 && spheres[0][1] <= this.options.maxDistance) {
                const position = spheres[0][0].clone() as P;
                position.timestamp = dataFrame.createdTimestamp;
                position.accuracy.value = spheres[0][1];
                dataObject.setPosition(position);
                return resolve(dataObject);
            }
            resolve(dataObject);
        });
    }
}

export interface CellIdentificationOptions extends ObjectProcessingNodeOptions {
    /**
     * Maximum distance before ignoring the cell-id
     */
    maxDistance?: number;
}

import { DataFrame, DataObject, RelativeDistance, RelativeRSSI, RFTransmitterObject } from '../../data';
import { ObjectProcessingNodeOptions } from '../ObjectProcessingNode';
import { RelativePositionProcessing } from './RelativePositionProcessing';

/**
 * Relative RSSI processing node to convert [[RelativeRSSI]] to [[RelativeDistance]] using
 * a distance propagation formula.
 */
export class RelativeRSSIProcessing<InOut extends DataFrame> extends RelativePositionProcessing<InOut, RelativeRSSI> {
    protected options: RelativeRSSIOptions;

    constructor(relativePositionType: new () => RelativeRSSI, options?: RelativeRSSIOptions) {
        super(relativePositionType, options);
    }

    public processRelativePositions(
        dataObject: DataObject,
        relativePositions: Map<RelativeRSSI, RFTransmitterObject>,
    ): Promise<DataObject> {
        return new Promise((resolve) => {
            relativePositions.forEach((relativeObj, relValue) => {
                const distance = this.convertToDistance(relValue, relativeObj);
                dataObject.addRelativePosition(distance);
            });
            resolve(dataObject);
        });
    }

    protected convertToDistance(rel: RelativeRSSI, transmitter: RFTransmitterObject): RelativeDistance {
        const relativeDistance = new RelativeDistance(transmitter);
        switch (this.options.propagationModel) {
            case PropagationModel.LOG_DISTANCE:
                relativeDistance.distance = Math.pow(
                    10,
                    (transmitter.calibratedRSSI - rel.rssi) / (10 * transmitter.environmenFactor),
                );
                break;
        }
        return relativeDistance;
    }
}

export interface RelativeRSSIOptions extends ObjectProcessingNodeOptions {
    /**
     * RSSI distance propagation model
     *
     * @default PropagationModel.LOG_DISTANCE
     */
    propagationModel?: PropagationModel;
}

export enum PropagationModel {
    /**
     * Log distance path loss
     *
     * @see {@link https://en.wikipedia.org/wiki/Log-distance_path_loss_model}
     */
    LOG_DISTANCE,
}

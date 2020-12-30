import { DataFrame, DataObject, LinearVelocity } from '../../../data';
import { ObjectProcessingNode } from '../../ObjectProcessingNode';
import { TimeUnit, LengthUnit, LinearVelocityUnit } from '../../../utils';
import { TimeService } from '../../../service';

/**
 * Calculate linear and angular velocity
 *
 * @category Processing node
 */
export class VelocityCalculationNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (object.getPosition()) {
                // Estimate linear and angular velocity
                this.predictVelocity(object).then(resolve).catch(reject);
            } else {
                resolve(object);
            }
        });
    }

    public predictVelocity(object: DataObject): Promise<DataObject> {
        return new Promise((resolve) => {
            const service = this.model.findDataService(object);
            const position = object.getPosition();
            service
                .findByUID(object.uid)
                .then((existingObject) => {
                    const existingPosition = existingObject.getPosition();
                    // Position difference
                    const difference = position
                        .toVector3(LengthUnit.METER)
                        .sub(existingPosition.toVector3(LengthUnit.METER));
                    const timeDifference = TimeService.getUnit().convert(
                        position.timestamp - existingPosition.timestamp,
                        TimeUnit.SECOND,
                    );
                    difference.divideScalar(timeDifference);
                    position.linearVelocity = new LinearVelocity(
                        difference.x,
                        difference.y,
                        difference.z,
                        LinearVelocityUnit.METER_PER_SECOND,
                    );
                    resolve(object);
                })
                .catch(() => {
                    resolve(object);
                });
        });
    }
}

import {
    AbsolutePosition,
    AbsolutePositionDeserializer,
    DataObject,
    SerializableMember,
    SerializableObject,
} from '../data';
import { DataService } from './DataService';
import { DataServiceDriver } from './DataServiceDriver';
import { FilterQuery } from './FilterQuery';

export class TrajectoryService<T extends AbsolutePosition> extends DataService<PositionIdentifier, DataObjectPosition> {
    constructor(dataServiceDriver: DataServiceDriver<PositionIdentifier, T>) {
        super(dataServiceDriver as any);

        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([this.createIndex('timestamp')])
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Find the last stored position of an object.
     *
     * @param {string} uid Unique identifier of data object
     * @returns {Promise<AbsolutePosition>} Promise of last known position
     */
    public findPosition(uid: string): Promise<AbsolutePosition> {
        return new Promise((resolve, reject) => {
            const filter: FilterQuery<any> = {
                uid,
            };
            this.findAll(filter)
                .then((objects) => {
                    if (objects.length === 0) {
                        return resolve(undefined);
                    }
                    const lastPosition = objects.sort((a, b) => b.timestamp - a.timestamp)[0];
                    resolve(lastPosition.position);
                })
                .catch(reject);
        });
    }

    /**
     * Find the trajectory of an object from start to end date
     *
     * @param {string} uid Unique identifier of data object
     * @param {Date | number} start Start time or date
     * @param {Date | number} end End time or date
     * @returns {AbsolutePosition[]} Array of positions sorted by time
     */
    public findTrajectory(uid: string, start?: Date | number, end?: Date | number): Promise<AbsolutePosition[]> {
        return new Promise((resolve, reject) => {
            const filter: FilterQuery<any> = {
                uid,
                timestamp: {
                    $lt: end ? (end instanceof Date ? end.getTime() : end) : Number.MAX_VALUE,
                    $gt: start ? (start instanceof Date ? start.getTime() : start) : -1,
                },
            };
            this.findAll(filter)
                .then((objects) => {
                    resolve(objects.map((object) => object.position));
                })
                .catch(reject);
        });
    }

    public appendPosition(object: DataObject): Promise<DataObjectPosition> {
        const position = object.getPosition();
        if (position) {
            return this.insert(
                {
                    uid: object.uid,
                    timestamp: position.timestamp,
                },
                new DataObjectPosition(object.uid, position),
            );
        } else {
            return Promise.reject();
        }
    }
}

export interface PositionIdentifier {
    uid: string;
    timestamp: number;
}

@SerializableObject()
class DataObjectPosition implements PositionIdentifier {
    @SerializableMember()
    uid: string;
    @SerializableMember()
    timestamp: number;
    @SerializableMember({
        deserializer: AbsolutePositionDeserializer,
    })
    position: AbsolutePosition;

    constructor(uid?: string, position?: AbsolutePosition) {
        if (uid && position) {
            this.uid = uid;
            this.position = position;
            this.timestamp = this.position.timestamp;
        }
    }
}

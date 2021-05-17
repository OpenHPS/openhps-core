import { SerializableMember, SerializableObject } from '../data/decorators';
import { AbsolutePosition, AbsolutePositionDeserializer } from '../data/position';
import { DataObject } from '../data/object/DataObject';
import { DataService } from './DataService';
import { DataServiceDriver } from './DataServiceDriver';

export class TrajectoryService<T extends AbsolutePosition> extends DataService<PositionIdentifier, TrajectoryPoint> {
    constructor(dataServiceDriver?: DataServiceDriver<PositionIdentifier, T>) {
        super(dataServiceDriver as any);

        this.driver.once('ready', this._createIndexes.bind(this));
    }

    private _createIndexes(): Promise<void> {
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
            this.findAll({
                uid,
            })
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
            this.findAll({
                uid,
                timestamp: {
                    $lt: end ? (end instanceof Date ? end.getTime() : end) : Number.MAX_VALUE,
                    $gt: start ? (start instanceof Date ? start.getTime() : start) : -1,
                },
            })
                .then((objects) => {
                    resolve(objects.map((object) => object.position));
                })
                .catch(reject);
        });
    }

    /**
     * Append a position to the trajectory service
     *
     * @param {DataObject} object Data object to store
     * @param {TrajectoryPoint} previous Previous trajectory point
     * @returns {Promise<TrajectoryPoint>} Stored data object position
     */
    public appendPosition(object: DataObject, previous?: TrajectoryPoint): Promise<TrajectoryPoint> {
        const position = object.getPosition();
        if (position) {
            return this.insert(
                {
                    uid: object.uid,
                    timestamp: position.timestamp,
                    previous,
                },
                new TrajectoryPoint(object.uid, position, previous),
            );
        } else {
            return Promise.reject();
        }
    }
}

export interface PositionIdentifier {
    uid: string;
    timestamp: number;
    previous?: PositionIdentifier;
}

@SerializableObject()
export class TrajectoryPoint implements PositionIdentifier {
    @SerializableMember()
    uid: string;
    @SerializableMember()
    timestamp: number;
    @SerializableMember({
        deserializer: AbsolutePositionDeserializer,
    })
    position: AbsolutePosition;
    @SerializableMember()
    previous: PositionIdentifier = undefined;

    constructor(uid?: string, position?: AbsolutePosition, previous?: PositionIdentifier) {
        if (uid && position) {
            this.uid = uid;
            this.position = position;
            this.timestamp = this.position.timestamp;
            this.previous = previous;
        }
    }
}

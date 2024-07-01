import { DataSerializerUtils } from '../DataSerializerUtils';

export const CHANGELOG_METADATA_KEY = Symbol('__changelog__');

export interface SerializableChangelog {
    [CHANGELOG_METADATA_KEY]?: ChangeLog;
}

/**
 * Change log for tracking changes on an object
 */
export class ChangeLog {
    /**
     * Changes
     */
    protected changes: Change[] = [];

    /**
     * Reset the log with the assumption that the object has been saved
     */
    reset(): void {
        this.changes = [];
    }

    /**
     * Add a change to the log
     * @param property {string} Property key
     * @param oldValue {any} Old value
     * @param newValue {any} New value
     */
    addChange(property: string, oldValue: any, newValue: any) {
        if (oldValue === newValue) {
            return;
        }
        this.changes.push({
            property,
            oldValue,
            newValue,
            date: new Date(),
        });
    }

    /**
     * Get the latest changes
     * @returns {Change[]} Latest changes
     */
    getLatestChanges(): Change[] {
        // Get the changes per property
        const changesPerProperty: { [key: string]: Change[] } = {};
        this.changes.forEach((change) => {
            if (!changesPerProperty[change.property]) {
                changesPerProperty[change.property] = [];
            }
            changesPerProperty[change.property].push(change);
        });
        // Sort the changes by date
        Object.keys(changesPerProperty).forEach((property) => {
            changesPerProperty[property].sort((a, b) => a.date.getTime() - b.date.getTime());
        });
        // Filter out changes that end with the same value as the initial state
        const unchangedProperties: string[] = [];
        Object.keys(changesPerProperty).forEach((property) => {
            const lastIndex = changesPerProperty[property].length - 1;
            if (changesPerProperty[property][0].oldValue === changesPerProperty[property][lastIndex].newValue) {
                unchangedProperties.push(property);
            }
        });
        // Remove the unchanged properties
        Object.keys(changesPerProperty).forEach((property) => {
            changesPerProperty[property] = changesPerProperty[property].filter(
                () => !unchangedProperties.includes(property),
            );
        });
        // Aggregate all changes of each properties
        const changes = Object.keys(changesPerProperty)
            .map((property) => {
                const lastIndex = changesPerProperty[property].length - 1;
                const firstChange = changesPerProperty[property][0];
                const lastChange = changesPerProperty[property][lastIndex];
                if (lastChange) {
                    return {
                        property,
                        oldValue: firstChange.oldValue,
                        newValue: lastChange.newValue,
                        date: lastChange.date,
                    };
                }
                return undefined;
            })
            .filter((p) => p !== undefined);
        return changes;
    }

    /**
     * Get the deleted properties
     * @returns {string[]} Deleted properties
     */
    getDeletedProperties(): string[] {
        return this.getLatestChanges()
            .filter((change) => change.newValue === undefined)
            .map((change) => change.property);
    }

    /**
     * Get the added properties
     * @returns {string[]} Added properties
     */
    getAddedProperties(): string[] {
        return this.getLatestChanges()
            .filter((change) => change.oldValue === undefined)
            .map((change) => change.property);
    }
}

export interface Change {
    /**
     * Property name
     */
    property: string;
    /**
     * Old value
     */
    oldValue: any;
    /**
     * New value
     */
    newValue: any;
    /**
     * Change date
     */
    date: Date;
}

/**
 * Get the change log of an object
 * @param target Target object
 */
export function getChangeLog<T extends Object>(target: T & SerializableChangelog): ChangeLog { // eslint-disable-line
    return target[CHANGELOG_METADATA_KEY];
}

const IGNORED_TYPES = [Uint8Array, Date];

/**
 * Create a change log for an object
 * @param target Target object
 */
export function createChangeLog<T extends Object>(target: T): T & SerializableChangelog { // eslint-disable-line
    target[CHANGELOG_METADATA_KEY] = new ChangeLog();
    // Wrap all data members with a changelog to track deep changes
    const metadata = DataSerializerUtils.getOwnMetadata(target.constructor);
    if (metadata) {
        const watchedProperties: string[] = [];
        metadata.dataMembers.forEach((member) => {
            watchedProperties.push(member.key);
            if (target[member.key]) {
                if (Array.isArray(target[member.key])) {
                    target[member.key].forEach((element) => {
                        if (element instanceof Object) {
                            element = createChangeLog(element);
                        }
                    });
                } else if (target[member.key] instanceof Map || target[member.key] instanceof Set) {
                    target[member.key].forEach((element) => {
                        if (element instanceof Object) {
                            element = createChangeLog(element);
                        }
                    });
                } else if (target[member.key] instanceof Object) {
                    // Only wrap objects that are not ignored
                    if (!IGNORED_TYPES.includes(target[member.key].constructor)) {
                        target[member.key] = createChangeLog(target[member.key]);
                    }
                }
            }
        });
        // Wrap the target in a proxy to track changes
        const proxy = new Proxy(target, {
            set: (obj, prop, value) => {
                if (watchedProperties.includes(prop.toString())) {
                    if (obj[prop] !== value) {
                        obj[CHANGELOG_METADATA_KEY].addChange(prop.toString(), obj[prop], value);
                    }
                    obj[prop] = value;
                } else {
                    // Get the current state of watched properties
                    const currentState = {};
                    watchedProperties.forEach((watchedProperty) => {
                        currentState[watchedProperty] = obj[watchedProperty];
                    });
                    obj[prop] = value;
                    // Determine if a setter modified another variable
                    watchedProperties.forEach((watchedProperty) => {
                        if (currentState[watchedProperty] !== obj[watchedProperty]) {
                            obj[CHANGELOG_METADATA_KEY].addChange(
                                watchedProperty,
                                currentState[watchedProperty],
                                obj[watchedProperty],
                            );
                        }
                    });
                }
                return true;
            },
        }) as T & SerializableChangelog;
        return proxy;
    }
    return target;
}

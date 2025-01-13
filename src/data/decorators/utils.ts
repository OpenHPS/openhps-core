const cloneDeep = require('lodash.clonedeep'); // eslint-disable-line

export { cloneDeep };

/**
 * Check if something is an object
 * @param {any} item Item to check for object
 * @returns {boolean} Is an object
 */
export function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge objects
 * @param {any} target Target object
 * @param {any} source Source object
 * @returns {any} Merged object
 */
export function mergeDeep(target: any, source: any): any {
    const output = cloneDeep(target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (Array.isArray(source[key])) {
                output[key] = source[key];
                const targetProperty =
                    target[key] !== undefined ? (Array.isArray(target[key]) ? target[key] : [target[key]]) : [];
                output[key].push(...targetProperty.filter((val: any) => !source[key].includes(val)));
            } else if (isObject(source[key])) {
                if (!(key in target)) Object.assign(output, { [key]: source[key] });
                else output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

export const SerializationUtils = {
    cloneDeep,
    mergeDeep,
};

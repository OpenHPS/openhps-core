/**
 * Deep clone a value.
 *
 * Replaces `require('lodash.clonedeep')`. That was a bare CommonJS require in a
 * file re-exported through the public barrel, which tsc leaves untouched in the
 * ESM output — so any native-ESM consumer hit "require is not defined in ES module
 * scope" the moment the package was imported.
 *
 * `structuredClone` is not a substitute here: the serialization layer clones
 * typedjson member metadata, which holds constructor references and
 * serializer/deserializer hooks, and structuredClone throws on functions.
 * Matching lodash, functions are therefore carried over by reference rather than
 * cloned, and prototypes are preserved so class instances stay their own type.
 * @param {any} value Value to clone
 * @param {WeakMap} seen Tracks visited objects so cyclic graphs terminate
 * @returns {any} A deep copy of the value
 */
export function cloneDeep<T>(value: T, seen: WeakMap<object, any> = new WeakMap()): T {
    // Primitives, null, undefined and functions are all returned as they are.
    if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return value;
    if (typeof value === 'function') return value;

    const source = value as unknown as object;
    if (seen.has(source)) return seen.get(source);

    if (Array.isArray(source)) {
        const copy: any[] = [];
        seen.set(source, copy);
        for (const item of source) copy.push(cloneDeep(item, seen));
        return copy as unknown as T;
    }
    if (source instanceof Date) return new Date(source.getTime()) as unknown as T;
    if (source instanceof RegExp) return new RegExp(source.source, source.flags) as unknown as T;
    if (source instanceof Map) {
        const copy = new Map();
        seen.set(source, copy);
        for (const [k, v] of source) copy.set(cloneDeep(k, seen), cloneDeep(v, seen));
        return copy as unknown as T;
    }
    if (source instanceof Set) {
        const copy = new Set();
        seen.set(source, copy);
        for (const v of source) copy.add(cloneDeep(v, seen));
        return copy as unknown as T;
    }
    if (ArrayBuffer.isView(source)) {
        // Typed arrays and DataView: copy the bytes, keep the view type.
        const ctor = (source as any).constructor;
        return new ctor((source as any).buffer.slice(0)) as unknown as T;
    }
    if (source instanceof ArrayBuffer) return source.slice(0) as unknown as T;

    const copy = Object.create(Object.getPrototypeOf(source));
    seen.set(source, copy);
    for (const key of Object.keys(source)) {
        copy[key] = cloneDeep((source as any)[key], seen);
    }
    return copy as T;
}

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

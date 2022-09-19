import { FilterQuery, QuerySelector } from './FilterQuery';

/**
 * Query evaluator for {@link FilterQuery}s with {@link MemoryDataService}.
 */
export class MemoryQueryEvaluator {
    private static isRegexQuery(query: any): boolean {
        return Object.prototype.toString.call(query) === '[object RegExp]';
    }

    static evaluateComponent<T>(object: T, key: string, query: any): boolean {
        let result = true;
        const value = (object as any)[key];
        if (key.startsWith('$')) {
            result = result && MemoryQueryEvaluator.evaluateOp(key, object, query);
        } else if (key.includes('.')) {
            result = result && MemoryQueryEvaluator.evaluatePath(object, key, query);
        } else if (MemoryQueryEvaluator.isRegexQuery(query)) {
            result = result && (value as string).match(query) ? true : false;
        } else if (typeof query === 'object') {
            result = result && MemoryQueryEvaluator.evaluateSelector(value, query);
        } else {
            result = result && value === query;
        }
        return result;
    }

    static evaluate<T>(object: T, query: FilterQuery<T>): boolean {
        let result = true;
        if (query) {
            for (const key of Object.keys(query)) {
                result = result && MemoryQueryEvaluator.evaluateComponent(object, key, query[key]);
            }
        }
        return result;
    }

    static getValueFromPath<T>(object: T, path: string): [any, any, string] {
        // https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arays-by-string-path
        let o: any = object;
        path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        path = path.replace(/^\./, ''); // strip a leading dot
        const a = path.split('.');
        for (let i = 0, n = a.length; i < n; ++i) {
            const k = a[i];
            if (!o) {
                return undefined;
            } else if (k in o) {
                if (i < n - 1) {
                    o = o[k];
                } else {
                    return [o, o[k], k];
                }
            } else {
                return undefined;
            }
        }
    }

    protected static evaluatePath<T>(object: T, path: string, query: FilterQuery<T>): boolean {
        const data = MemoryQueryEvaluator.getValueFromPath(object, path);
        if (!data) {
            return false;
        }
        return MemoryQueryEvaluator.evaluateComponent(data[0], data[2], query);
    }

    protected static evaluateSelector<T>(value: any, subquery: QuerySelector<T>): boolean {
        let result = true;
        for (const selector of Object.keys(subquery)) {
            result = result && MemoryQueryEvaluator.evaluateComparisonSelector(selector, value, subquery);
            result = result && MemoryQueryEvaluator.evaluateArraySelector(selector, value, subquery);
        }
        return result;
    }

    protected static evaluateComparisonSelector<T>(selector: string, value: any, subquery: QuerySelector<T>): boolean {
        let result = true;
        switch (selector) {
            case '$gt':
                result = result && value > subquery[selector];
                break;
            case '$gte':
                result = result && value >= subquery[selector];
                break;
            case '$lt':
                result = result && value < subquery[selector];
                break;
            case '$lte':
                result = result && value <= subquery[selector];
                break;
            case '$eq':
                result = result && value === subquery[selector];
                break;
        }
        return result;
    }

    protected static evaluateArraySelector<T>(selector: string, value: any, subquery: QuerySelector<T>): boolean {
        let result = true;
        switch (selector) {
            case '$in':
                result = result && Array.from(value).includes(subquery[selector]);
                break;
            case '$nin':
                result = result && !Array.from(value).includes(subquery[selector]);
                break;
            case '$elemMatch':
                result = false;
                if (value instanceof Array) {
                    Array.from(value).forEach((element) => {
                        if (element['key'] && element['value']) {
                            result = result || MemoryQueryEvaluator.evaluate(element['value'], subquery[selector]);
                        } else {
                            result = result || MemoryQueryEvaluator.evaluate(element, subquery[selector]);
                        }
                    });
                } else if (value instanceof Map) {
                    value.forEach((element) => {
                        result = result || MemoryQueryEvaluator.evaluate(element, subquery[selector]);
                    });
                }
                result = result && result;
                break;
        }
        return result;
    }

    protected static evaluateOp<T>(key: string, object: T, subquery: Array<FilterQuery<T>>): boolean {
        let result;
        switch (key) {
            case '$and':
                result = true;
                for (const query of subquery) {
                    result = result && MemoryQueryEvaluator.evaluate(object, query);
                }
                break;
            case '$or':
                result = false;
                for (const query of subquery) {
                    result = result || MemoryQueryEvaluator.evaluate(object, query);
                }
                break;
        }
        return result;
    }
}

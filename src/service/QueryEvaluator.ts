import { FilterQuery, QuerySelector } from './FilterQuery';

/**
 * Query evaluator for [[FilterQuery]]s
 */
export class QueryEvaluator {
    private static isRegexQuery(query: any): boolean {
        return Object.prototype.toString.call(query) === '[object RegExp]';
    }

    public static evaluateComponent<T>(object: T, key: string, query: any): boolean {
        let result = true;
        const value = (object as any)[key];
        if (key.startsWith('$')) {
            result = result && QueryEvaluator.evaluateOp(key, object, query);
        } else if (key.includes('.')) {
            result = result && QueryEvaluator.evaluatePath(object, key, query);
        } else if (QueryEvaluator.isRegexQuery(query)) {
            result = result && (value as string).match(query) ? true : false;
        } else if (typeof query === 'object') {
            result = result && QueryEvaluator.evaluateSelector(value, query);
        } else {
            result = result && value === query;
        }
        return result;
    }

    public static evaluate<T>(object: T, query: FilterQuery<T>): boolean {
        let result = true;
        if (query) {
            for (const key of Object.keys(query)) {
                result = result && QueryEvaluator.evaluateComponent(object, key, query[key]);
            }
        }
        return result;
    }

    protected static evaluatePath<T>(object: T, path: string, query: FilterQuery<T>): boolean {
        // https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arays-by-string-path
        let o: any = object;
        path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        path = path.replace(/^\./, ''); // strip a leading dot
        const a = path.split('.');
        for (let i = 0, n = a.length; i < n; ++i) {
            const k = a[i];
            if (!o) {
                return false;
            } else if (k in o) {
                if (i < n - 1) {
                    o = o[k];
                } else {
                    return QueryEvaluator.evaluateComponent(o, k, query);
                }
            } else {
                return false;
            }
        }
    }

    protected static evaluateSelector<T>(value: any, subquery: QuerySelector<T>): boolean {
        let result = true;
        for (const selector of Object.keys(subquery)) {
            result = result && QueryEvaluator.evaluateComparisonSelector(selector, value, subquery);
            result = result && QueryEvaluator.evaluateArraySelector(selector, value, subquery);
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
                            result = result || QueryEvaluator.evaluate(element['value'], subquery[selector]);
                        } else {
                            result = result || QueryEvaluator.evaluateComponent(element, selector, subquery[selector]);
                        }
                    });
                } else if (value instanceof Map) {
                    value.forEach((element) => {
                        result = result || QueryEvaluator.evaluate(element, subquery[selector]);
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
                    result = result && QueryEvaluator.evaluate(object, query);
                }
                break;
            case '$or':
                result = false;
                for (const query of subquery) {
                    result = result || QueryEvaluator.evaluate(object, query);
                }
                break;
        }
        return result;
    }
}

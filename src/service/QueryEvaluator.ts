import { FilterQuery, QuerySelector } from "./FilterQuery";

/**
 * Query evaluator for [[FilterQuery]]s
 */
export class QueryEvaluator {

    public static evaluateComponent<T>(object: T, key: string, query: any): boolean {
        let result = true;
        if (key.startsWith("$")) {
            switch (key) {
                case "$and":
                    result = result && QueryEvaluator.evaluateOpAnd(object, query);
                    break;
                case "$or":
                    result = result && QueryEvaluator.evaluateOpOr(object, query);
                    break;
            }
        } else if (key.includes(".")) {
            result = result && QueryEvaluator.evaluatePath(object, key, query);
        } else if (Object.prototype.toString.call(query) === '[object RegExp]') {
            result = result && ((object as any)[key] as string).match(query) ? true : false;
        } else if (typeof query === 'object') {
            result = result && QueryEvaluator.evaluateSelector((object as any)[key], query);
        } else {
            result = result && (object as any)[key] === query;
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
        path = path.replace(/^\./, '');           // strip a leading dot
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
            switch (selector) {
                case "$gt":
                    result = result && value > subquery[selector];
                    break;
                case "$gte":
                    result = result && value >= subquery[selector];
                    break;
                case "$lt":
                    result = result && value < subquery[selector];
                    break;
                case "$lte":
                    result = result && value <= subquery[selector];
                    break;
                case "$eq":
                    result = result && value === subquery[selector];
                    break;
            }
        }
        return result;
    }

    protected static evaluateOpAnd<T>(object: T, subquery: Array<FilterQuery<T>>): boolean {
        let result = true;
        for (const query of subquery) {
            result = result && QueryEvaluator.evaluate(object, query);
        }
        return result;
    }

    protected static evaluateOpOr<T>(object: T, subquery: Array<FilterQuery<T>>): boolean {
        let result = false;
        for (const query of subquery) {
            result = result || QueryEvaluator.evaluate(object, query);
        }
        return result;
    }

}
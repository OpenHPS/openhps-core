/**
 * Filter Query based on MongoDB
 * 
 * @source https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/mongodb/index.d.ts
 */

export interface QuerySelector<T> {
    $eq?: T;
    $gt?: T;
    $gte?: T;
    $lt?: T;
    $lte?: T;
}

export interface RootQuerySelector<T> {
    $and?: Array<FilterQuery<T>>;
    $or?: Array<FilterQuery<T>>;
    [key: string]: any;
}

export type FilterQuery<T> = {
    [P in keyof T]?: QuerySelector<T[P]> | T[P] | RegExp;
} & RootQuerySelector<T>;

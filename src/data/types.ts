import * as typedjsonobject from 'typedjson';
import {
    ensureTypeDescriptor,
    ArrayTypeDescriptor,
    MapTypeDescriptor,
    SetTypeDescriptor,
} from 'typedjson/lib/cjs/type-descriptor';
import { isSubtypeOf, isInstanceOf, isValueDefined, nameof } from 'typedjson/lib/cjs/helpers';
import { mergeOptions } from 'typedjson/lib/cjs/options-base';

export const TypedJSON = {
    ...typedjsonobject,
    utils: {
        isInstanceOf,
        isValueDefined,
        nameof,
        isSubtypeOf,
    },
    options: {
        mergeOptions,
    },
    typeDescriptor: {
        ensureTypeDescriptor,
        ArrayTypeDescriptor,
        MapTypeDescriptor,
        SetTypeDescriptor,
    },
};

export type { OptionsBase } from 'typedjson/lib/types/options-base';

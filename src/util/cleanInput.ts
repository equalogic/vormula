import mapValues from 'lodash.mapvalues';
import isPlainObject from 'lodash.isplainobject';

/**
 * Accepts a plain object containing user input, and cleans any string fields by:
 *
 * 1) trimming whitespace, and then
 * 2) replacing empty strings with null
 *
 * It will recurse through any nested objects.
 */
export function cleanInput<T extends Record<string, any>>(input: T): T {
  return mapValues(input, value => {
    if (typeof value === 'string') {
      return value.trim().length > 0 ? value.trim() : null;
    }

    if (isPlainObject(value)) {
      return cleanInput(value);
    }

    return value;
  });
}

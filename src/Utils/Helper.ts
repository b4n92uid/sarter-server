import { isNil, isArray, isString } from "lodash";

/**
 * Is Array available
 */
export function isArrayAvailable(array) {
  return !isNil(array) && isArray(array) && array.length > 0;
}

/**
 * Is String available
 */
export function isStringAvailable(str) {
  return !isNil(str) && isString(str) && str.length > 0;
}

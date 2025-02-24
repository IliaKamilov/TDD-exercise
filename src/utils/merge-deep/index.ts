import { cloneDeep } from "../clone-deep";
import { isObject } from "../is-object";

/**
 * Merge deep copy values of enumerable properties of target object source to a new object
 * @param target The target object to merge deep copy values
 * @param source The source object to merge deep copy properties
 * @returns A merged deep copy object
 */

export function mergeDeep<T extends object, S extends object>(
  target: T,
  source: S,
): T & S {
  if (isObject(source) && Object.keys(source).length === 0)
    return cloneDeep(Object.assign(target, source));

  const output = Object.assign(target, source);

  if (isObject(source) && isObject(target)) {
    for (const key in source) {
      if (isObject(source[key]) && key in target && isObject(target[key])) {
        (output as Record<string, unknown>)[key] = mergeDeep(
          target[key] as object,
          source[key] as object,
        );
      } else {
        (output as Record<string, unknown>)[key] = isObject(source[key])
          ? cloneDeep(source[key])
          : source[key];
      }
    }
  }

  return output;
}

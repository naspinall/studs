export const invertRecord = (
  object: Record<string, string>
): Record<string, string> =>
  // Inverting key and value
  Object.keys(object).reduce(
    (accumulator, key) => ({ [object[key]]: key, ...accumulator }),
    {} as Record<string, string>
  );

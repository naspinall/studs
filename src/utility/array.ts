import { Primitive } from "./types";

export const toLowercase = (value: string) => {
  return value.charAt(0).toLowerCase() + value.slice(1);
};

const defaultFormatter = (input: Primitive) => String(input);

export const toParameterList = (start: number, length: number) => {
  const parameters: Array<string> = [];
  let count = start;

  for (let i = 0; i < length; i++) {
    count++;
    parameters.push(`$${count}`);
  }

  return toArray(parameters);
};

export const toArray = (
  array: Array<any>,
  formatter?: (input: any) => string
): string => {
  return array.map(formatter || defaultFormatter).join(", ");
};

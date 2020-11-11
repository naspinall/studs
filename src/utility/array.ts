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
) : string => {
  const format = formatter || defaultFormatter;
  return array.reduce((SQLString: string, value: Primitive, index: number) => {
    if (index === 0) return SQLString + format(value);
    return SQLString + ", " + format(value);
  }, "");
};

export const joinWhere = (queries: Array<string>) => {
  return queries
    .reduce((SQLString: string, value: string, index: number) => {
      if (index === 0) return SQLString + `${value}`;
      return SQLString + " and " + `${value}`;
    }, "")
    .trim();
};

import { NamedParameter, ParameterObject } from "./NamedParameters";

export const Raw = (
  SQLFunction: (alias: string) => string,
  parameters?: ParameterObject
) => new NamedParameter(SQLFunction, parameters);

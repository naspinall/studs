import { NamedParameter, ParameterObject } from "./NamedParameters";
import { Primitive } from "../utility/types";
import { OperatorConfiguration, SelectOperator } from "./Operator";

export class RawOperator implements SelectOperator<any> {
  private parameterObject?: ParameterObject;
  private SQLStringFunction: (alias: string) => string;
  private parameterCount: number = 0;
  private column!: string;

  constructor(
    SQLString: (alias: string) => string,
    parameters?: ParameterObject
  ) {
    this.SQLStringFunction = SQLString;
    this.parameterObject = parameters || {};
  }

  configure(config: OperatorConfiguration<any>): RawOperator {
    this.parameterCount = config.count || 0;
    return this;
  }

  getParamCount(): number {
    return this.parameterCount;
  }

  toSQL(): [string, Array<Primitive>] {
    // Creating the SQL String
    const aliasString = this.SQLStringFunction(this.column);
    const factory = new NamedParameter(
      aliasString,
      this.parameterObject || {}
    ).configure({
      alias: `${this.column}`,
      count: this.parameterCount,
    });

    const [SQLString, parameters] = factory.toSQL();

    // To ensure the parameter count is consistent
    this.parameterCount += parameters.length;
    return [SQLString, parameters];
  }
}

export const Raw = (
  SQLString: (alias: string) => string,
  parameters?: ParameterObject
) => new RawOperator(SQLString, parameters);

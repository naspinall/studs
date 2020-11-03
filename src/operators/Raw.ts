import { NamedParameter, ParameterObject } from "./NamedParameters";
import { Primitive } from "../utility/types";
import { OperatorConfiguration, SelectOperator } from "./Operator";

export class RawOperator implements SelectOperator<any> {
  private SQLStringFunction: (alias: string) => string;

  private column!: string;
  private alias!: string;

  private parameterObject: ParameterObject;
  private namedParameter: NamedParameter = new NamedParameter();

  constructor(
    SQLStringFunction: (alias: string) => string,
    parameterObject?: ParameterObject
  ) {
    this.SQLStringFunction = SQLStringFunction;
    this.parameterObject = parameterObject || {};
  }

  configure(config: OperatorConfiguration): RawOperator {
    this.alias = config.alias || "";
    this.column = config.column || "";
    this.namedParameter.configure({ count: config.count });
    return this;
  }

  getParameterManager() {
    return this.namedParameter.getParameterManager();
  }

  toSQL(): [string, Array<Primitive>] {
    // Build Raw Named Parameter SQL String
    const rawSQL = this.SQLStringFunction(`${this.alias}.${this.column}`);

    // Setting Named Parameter SQL String
    this.namedParameter.configure({
      SQLString: rawSQL,
      parameterObject: this.parameterObject,
    });

    // Building SQL
    return this.namedParameter.toSQL();
  }
}

export const Raw = (
  SQLString: (alias: string) => string,
  parameters?: ParameterObject
) => new RawOperator(SQLString, parameters);

import { OperatorConfiguration, SelectOperator } from "./Operator";
import { toParameterList } from "../utility/array";
import { Primitive } from "../utility/types";
import { ParameterManager } from "../common/ParameterManager";

export interface ParameterObject {
  [index: string]: Primitive | Array<Primitive>;
}

interface NamedParameterConfiguration extends OperatorConfiguration {
  SQLString?: string;
  parameterObject?: ParameterObject;
}

export class NamedParameter implements SelectOperator<any> {
  private SQLString!: string;
  private SQLStringFunction!: (alias: string) => string;
  private alias!: string;
  private parameterObject: ParameterObject;
  private parameterManager = new ParameterManager();

  constructor(
    SQL: string | ((alias: string) => string),
    parameterObject?: ParameterObject
  ) {
    if (typeof SQL === "string") this.SQLString = SQL;
    else this.SQLStringFunction = SQL;

    this.parameterObject = parameterObject || {};
  }

  configure({
    count,
    SQLString,
    parameterObject,
    alias,
    column,
  }: NamedParameterConfiguration): NamedParameter {
    this.parameterManager.configure({ count });
    this.SQLString = SQLString || this.SQLString;
    this.parameterObject = parameterObject || this.parameterObject;
    this.alias = `${alias}.${column}` || "";
    return this;
  }

  getParameterManager(): ParameterManager {
    return this.parameterManager;
  }

  parseParameter(name: string, value: Primitive | Array<Primitive>) {
    // Creating regexp
    const regexp = new RegExp(`:${name}`);

    // Checking is in string
    if (this.SQLString.match(regexp) === null) return;

    const array = this.parameterManager.addValue(value);
    this.SQLString = this.SQLString.replace(regexp, `${array}`);
  }

  parseParameterList(name: string, value: Array<Primitive>) {
    // Creating regexp
    const regexp = new RegExp(`:...${name}`);

    // Checking is in string
    if (this.SQLString.match(regexp) === null) return;

    const list = this.parameterManager.addList(value);
    this.SQLString = this.SQLString.replace(regexp, `${list}`);
  }

  // :value => a single parameter
  // :...value => multiple parameters
  toSQL(): [string, Array<Primitive>] {
    if (this.SQLStringFunction)
      this.SQLString = this.SQLStringFunction(this.alias);

    // Getting all names
    const names = Object.keys(this.parameterObject || {});

    // Iterating all names and paramaterzing
    names.forEach((name) => {
      //@ts-ignore
      const namedParameter = this.parameterObject[name];

      this.parseParameter(name, namedParameter);

      if (Array.isArray(namedParameter))
        this.parseParameterList(name, namedParameter);
    });

    // Returning greater than SQL string
    return [this.SQLString, this.parameterManager.getParameters()];
  }
}

import { OperatorConfiguration, SelectOperator } from "./Operator";
import { toParameterList } from "../utility/array";
import { Primitive } from "../utility/types";

export interface ParameterObject {
  [index: string]: Primitive | Array<Primitive>;
}

export class NamedParameter implements SelectOperator<any> {
  private SQLString: string;
  private parameterCount: number = 0;
  private parameterObject: ParameterObject;
  private parameters: Array<Primitive> = [];

  constructor(SQLString: string, parameterObject: ParameterObject) {
    this.SQLString = SQLString;
    this.parameterObject = parameterObject;
  }

  configure(config: OperatorConfiguration<any>): NamedParameter {
    this.parameterCount = config.count || 0;
    return this;
  }

  getParamCount(): number {
    return this.parameterCount;
  }

  parseParameter(name: string) {
    // Creating regexp
    const regexp = new RegExp(`:${name}`);

    // Incrementing parameter count
    this.parameterCount++;

    // Replacing value with paramter
    this.SQLString = this.SQLString.replace(regexp, `$${this.parameterCount}`);
  }

  parseParameterList(name: string, length: number) {
    const regexp = new RegExp(`:...${name}`);

    // Build parameter list
    const parametersList = toParameterList(this.parameterCount, length);

    // Incrementing parameter count
    this.parameterCount += length;

    // Replacing value with paramter
    this.SQLString = this.SQLString.replace(regexp, `${parametersList}`);
  }

  // :value => a single parameter
  // :...value => multiple parameters
  toSQL(): [string, Array<Primitive>] {
    // Getting all names
    const names = Object.keys(this.parameterObject || {});

    // Iterating all names and paramatersing
    names.forEach((name) => {
      //@ts-ignore
      const namedParameter = this.parameterObject[name];
      if (Array.isArray(namedParameter)) {
        // Substitute named parameters
        this.parseParameterList(name, namedParameter.length);
        // Push parameters
        this.parameters.push(...namedParameter);
      } else {
        // Substitute named parameters
        this.parseParameter(name);
        // Push parameters
        this.parameters.push(namedParameter);
      }
    });

    // Returning greater than SQL string
    return [this.SQLString, this.parameters];
  }
}

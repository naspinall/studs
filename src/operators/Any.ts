import { Primitive } from "../utility/types";
import {
  Operator,
} from "./Operator";

export class AnyOperator extends Operator<any> {
  private parameters: Array<Primitive>;

  constructor(parameters: Array<Primitive>) {
    super();
    this.parameters = parameters;
  }

  toSQL(): [string, Array<Primitive>] {
    // Converting types
    this.parameters = this.getSQLValue(this.parameters);

    // Getting the parameter list
    const parameterList = this.parameterManager.addValue(this.parameters);

    // Returning greater than SQL string
    return [
      `${this.alias}.${this.column} ANY (${parameterList})`,
      this.parameters,
    ];
  }
}

export const Any = (...parameters: Array<Primitive>) =>
  new AnyOperator(parameters);

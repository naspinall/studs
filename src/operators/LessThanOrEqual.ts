import { Primitive } from "../utility/types";
import { Operator } from "./Operator";

export class LessThanOrEqualOperator extends Operator<any> {
  private parameters: Primitive;

  constructor(parameters: Primitive) {
    super();
    this.parameters = parameters;
  }

  toSQL(): [string, Array<Primitive>] {
    // Increment parameter count by 1
    this.parameterCount += 1;
    // Returning greater than SQL string
    return [` ${this.column} <= $${this.parameterCount}`, [this.parameters]];
  }
}

export const LessOrEqualThan = (parameters: Primitive) =>
  new LessThanOrEqualOperator(parameters);

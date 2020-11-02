import { PartialEntity } from "../entity";
import { Primitive } from "../utility/types";
import { Operator } from "./Operator";

export class EqualOperator extends Operator<any> {
  private parameters: Primitive;
  constructor(parameters: Primitive) {
    super();
    this.parameters = parameters;
  }

  toSQL(): [string, Array<Primitive>] {
    // Increment parameter count by 1
    this.parameterCount += 1;
    // Returning greater than SQL string
    return [`${this.column} = $${this.parameterCount}`, [this.parameters]];
  }
}

export const Equal = (parameters: Primitive) => new EqualOperator(parameters);

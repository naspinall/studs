import { Primitive } from "../utility/types";
import { Operator } from "./Operator";

export class BetweenOperator<T> extends Operator<T> {
  private parameters: Array<Primitive>;
  constructor(parameters: Array<Primitive>) {
    super();
    this.parameters = parameters;
  }

  toSQL(): [string, Array<Primitive>] {
    // Converting SQL Value
    this.parameters = this.getSQLValue(this.parameters);

    // Getting parameterized value
    const lower = this.parameterManager.addValue(this.parameters[0]);
    const upper = this.parameterManager.addValue(this.parameters[1]);

    // Returning greater than SQL string
    return [
      `${this.alias}.${this.column} BETWEEN ${lower} AND ${upper}`,
      [lower, upper],
    ];
  }
}

export const Between = (lower: Primitive, upper: Primitive) =>
  new BetweenOperator([lower, upper]);

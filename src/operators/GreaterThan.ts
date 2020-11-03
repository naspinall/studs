import { Primitive } from "../utility/types";
import { Operator } from "./Operator";

export class GreaterThanOperator extends Operator<any> {
  private parameters: Primitive;

  constructor(parameters: Primitive) {
    super();
    this.parameters = parameters;
  }

  toSQL(): [string, Array<Primitive>] {
    // Converting SQL Value
    this.parameters = this.getSQLValue(this.parameters);

    // Getting parameterized value
    const parameterized = this.parameterManager.addValue(this.parameters);

    // Returning greater than SQL string
    return [
      `${this.alias}.${this.column} > ${parameterized}`,
      [this.parameters],
    ];
  }
}

export const GreaterThan = (parameters: Primitive) =>
  new GreaterThanOperator(parameters);

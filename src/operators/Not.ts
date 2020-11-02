import { Primitive } from "../utility/types";
import { isSelectOperator, Operator, SelectOperator } from "./Operator";

export class NotOperator extends Operator<any> {
  private parameters: Primitive | SelectOperator<any>;
  constructor(parameters: Primitive | SelectOperator<any>) {
    super();
    this.parameters = parameters;
  }

  toSQL(): [string, Array<Primitive>] {
    if (isSelectOperator(this.parameters)) {
      const [SQLString, parameters] = this.parameters
        .configure({
          count: this.parameterCount,
        })
        .toSQL();

      return [`${this.column} NOT ${SQLString}`, parameters];
    }

    // Increment parameter count by 1
    this.parameterCount += 1;
    // Returning greater than SQL string
    return [` ${this.column} NOT $${this.parameterCount}`, [this.parameters]];
  }
}

export const Not = (parameters: Primitive) => new NotOperator(parameters);

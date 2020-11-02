import { Primitive } from "../utility/types";
import { Operator, SelectOperator } from "./Operator";

export class OrOperator<T> extends Operator<T> {
  private operators: Array<SelectOperator<T>>;
  private sqlString: string = "";
  constructor(operators: Array<SelectOperator<T>>) {
    super();
    this.operators = operators;
  }

  toSQL(): [string, Array<Primitive>] {
    const parameters: Array<Primitive> = [];

    this.operators.forEach((operator) => {
      // Building SQL for all operators
      const [sqlString, values] = operator
        .configure({
          count: this.parameterCount,
          alias: this.column,
        })
        .toSQL();

      // Incrementing parameter count
      this.parameterCount = operator.getParamCount();

      if (parameters.length === 0) this.sqlString += `${sqlString}`;
      else this.sqlString += ` OR ${sqlString}`;

      // Adding values
      parameters.push(...values);
    });

    // Returning greater than SQL string
    return [`(${this.sqlString})`, parameters];
  }
}

export const Or = (...operators: Array<SelectOperator<any>>) =>
  new OrOperator(operators);

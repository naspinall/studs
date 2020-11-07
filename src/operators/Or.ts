import { ParameterManager } from "../common/ParameterManager";
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

    this.operators.forEach((operator, index) => {

      // Building SQL for all operators
      const [sqlString] = operator
        .configure({
          count: this.parameterManager.getParameterCount(),
          alias: this.alias,
          column: this.column,
          metadata : this.metadata
        })
        .toSQL();

      this.parameterManager.merge(operator.getParameterManager());

      if (index === 0) this.sqlString += sqlString;
      else this.sqlString += ` or ${sqlString}`;

      // Adding values
      parameters.push(...operator.getParameterManager().getParameters());
    });

    // Returning greater than SQL string
    return [`(${this.sqlString})`, parameters];
  }
}

export const Or = (...operators: Array<SelectOperator<any>>) =>
  new OrOperator(operators);

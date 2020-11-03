import { Primitive } from "../utility/types";
import {
  isSelectOperator,
  isSelectOperatorArray,
  Operator,
  SelectOperator,
} from "./Operator";

export class InOperator extends Operator<any> {
  private parameters: Array<Primitive> | SelectOperator<any>;

  constructor(parameters: Array<Primitive> | SelectOperator<any>) {
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

      return [`${this.column} IN (${SQLString})`, parameters];
    }

    // Converting types
    this.parameters = this.getSQLValue(this.parameters);

    // Getting the parameter list
    const parameterList = this.parameterManager.addList(this.parameters);

    // Returning greater than SQL string
    return [`${this.alias}.${this.column} IN (${parameterList})`, this.parameters];
  }
}

export const In = (
  ...parameters: Array<Primitive> | Array<SelectOperator<any>>
) => {
  if (isSelectOperatorArray(parameters) && parameters.length > 0)
    return new InOperator(parameters[0]);
  //@ts-expect-error TODO work out this typing issue
  else return new InOperator(parameters);
};

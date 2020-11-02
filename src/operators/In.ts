import { toParameterList } from "../utility/array";
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

    // Build parameter list
    const parameters = toParameterList(
      this.parameterCount,
      this.parameters.length
    );

    // Increment parameter count by parameter length
    this.parameterCount += this.parameters.length;
    // Returning greater than SQL string
    return [`${this.column} IN (${parameters})`, this.parameters];
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

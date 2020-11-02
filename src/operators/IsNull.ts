import { Primitive } from "../utility/types";
import { Operator } from "./Operator";

export class IsNullOperator extends Operator<any> {
  parameterCount!: number;

  setParamCount(count: number) {
    this.parameterCount = count;
  }

  getParamCount() {
    return this.parameterCount;
  }

  toSQL(): [string, Array<Primitive>] {
    // Returning greater than SQL string
    return [` ${this.column} IS NULL`, []];
  }
}

export const IsNull = () => new IsNullOperator();

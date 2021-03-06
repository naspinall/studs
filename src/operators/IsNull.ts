import { Primitive } from "../utility/types";
import { Operator } from "./Operator";

export class IsNullOperator extends Operator<any> {
  parameterCount!: number;

  toSQL(): [string, Array<Primitive>] {
    // Returning greater than SQL string
    return [`${this.alias}.${this.column} IS NULL`, []];
  }
}

export const IsNull = () => new IsNullOperator();

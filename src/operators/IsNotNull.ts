import { Primitive } from "../utility/types";
import { Operator } from "./Operator";

export class IsNotNullOperator extends Operator<any> {
  parameterCount!: number;

  toSQL(): [string, Array<Primitive>] {
    // Returning greater than SQL string
    return [`${this.column} IS NOT NULL`, []];
  }
}

export const IsNotNull = () => new IsNotNullOperator();

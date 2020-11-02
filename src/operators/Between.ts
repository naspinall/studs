// import { Primitive } from "../utility/types";
// import { Operator } from "./Operator";

// export class BetweenOperator<T> extends Operator<T> {
//   private parameters: Array<Primitive>;
//   constructor(parameters: Array<Primitive>) {
//     super();
//     this.parameters = parameters;
//   }

//   toSQL(): [string, Array<Primitive>] {
//     this.parameterCount += 2;
//     // Returning greater than SQL string
//     return [
//       `BETWEEN $${this.parameterCount - 2} AND ${this.parameterCount - 1}`,
//       this.parameters,
//     ];
//   }
// }

// export const Between = (lower: PartialEntity<T>, upper: PartialEntity<T>) =>
//   new BetweenOperator([lower, upper]);

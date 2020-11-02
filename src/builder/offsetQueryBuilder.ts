import { OperatorConfiguration } from "../operators/Operator";
import { Primitive } from "../utility/types";

export class OffsetQueryBuilder {
  private offset: number = 0;
  private parameterCount: number = 0;

  configure(config: OperatorConfiguration<any>): OffsetQueryBuilder {
    this.parameterCount = config.count || 0;
    return this;
  }
  

  setOffset(offset: number) {
    if (!Number.isInteger(offset)) throw new Error("Invalid offset");
    this.offset = offset;
  }

  toSQL(): [string, Array<Primitive>] {
    if (this.offset > 0) {
      return [`offset $${this.parameterCount + 1}`, [this.offset]];
    } else return ["", []];
  }
}

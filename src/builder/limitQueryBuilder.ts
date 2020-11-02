import { OperatorConfiguration } from "../operators/Operator";
import { Primitive } from "../utility/types";

export class LimitQueryBuilder {
  private limit: number = 0;
  private parameterCount: number = 0;

  configure(config: OperatorConfiguration<any>): LimitQueryBuilder {
    this.parameterCount = config.count || 0;
    return this;
  }

  setLimit(limit: number) {
    if (!Number.isInteger(limit)) throw new Error("Invalid limit");
    this.limit = limit;
  }

  toSQL(): [string, Array<Primitive>] {
    if (this.limit > 0) {
      return [`limit $${this.parameterCount + 1}`, [this.limit]];
    } else return ["", []];
  }
}

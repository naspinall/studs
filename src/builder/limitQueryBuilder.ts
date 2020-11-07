import { ParameterManager } from "../common/ParameterManager";
import { OperatorConfiguration } from "../operators/Operator";
import { Primitive } from "../utility/types";

export class LimitQueryBuilder {
  private limit: number = 0;
  private parameterManager = new ParameterManager();

  getParameterManager(): ParameterManager {
    return this.parameterManager;
  }

  configure({ count }: OperatorConfiguration): LimitQueryBuilder {
    this.parameterManager.configure({ count });
    return this;
  }

  setLimit(limit: number) {
    if (!Number.isInteger(limit)) throw new Error("Invalid limit");
    this.limit = limit;
  }

  toSQL(): [string, Array<Primitive>] {
    if (this.limit > 0) {
      const parameter = this.parameterManager.addValue(this.limit);
      return [` limit ${parameter}`, [this.limit]];
    } else return ["", []];
  }
}

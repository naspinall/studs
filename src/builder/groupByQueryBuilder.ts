import { ParameterManager } from "../common/ParameterManager";
import { OperatorConfiguration } from "../operators/Operator";
import { toArray } from "../utility/array";
import { Primitive } from "../utility/types";

export class GroupByQueryBuilder {
  private parameterManager = new ParameterManager();
  private groupByConditions: Array<string> = [];

  getParameterManager(): ParameterManager {
    return this.parameterManager;
  }

  configure({ count }: OperatorConfiguration): GroupByQueryBuilder {
    this.parameterManager.configure({ count });
    return this;
  }

  addGroupBy(conditions: Array<string>) {
    conditions.forEach((condition) => this.groupByConditions.push(condition));
  }

  toSQL(): [string, Array<Primitive>] {
    if (this.groupByConditions.length === 0) {
      return ["", []];
    }
    return [` group by ${toArray(this.groupByConditions)}`, []];
  }
}

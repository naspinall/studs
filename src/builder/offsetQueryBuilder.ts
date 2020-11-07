import { ParameterManager } from "../common/ParameterManager";
import { OperatorConfiguration } from "../operators/Operator";
import { Primitive } from "../utility/types";

export class OffsetQueryBuilder {
  private offset: number = 0;
  private parameterManager = new ParameterManager();

  getParameterManager(): ParameterManager {
    return this.parameterManager;
  }

  configure({ count }: OperatorConfiguration): OffsetQueryBuilder {
    this.parameterManager.configure({ count });
    return this;
  }

  setOffset(offset: number) {
    if (!Number.isInteger(offset)) throw new Error("Invalid offset");
    this.offset = offset;
  }

  toSQL(): [string, Array<Primitive>] {
    if (this.offset > 0) {
      const parameter = this.parameterManager.addValue(this.offset);
      return [` offset ${parameter}`, [this.offset]];
    } else return ["", []];
  }
}

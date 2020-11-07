import { ParameterManager } from "../common/ParameterManager";
import { OperatorConfiguration } from "../operators/Operator";
import { toArray } from "../utility/array";
import { Primitive } from "../utility/types";

export interface OrderBy {
  direction: "DESC" | "ASC";
  column: string;
}

export class OrderByQueryBuilder<T> {
  private orderByStatements: string[] = [];
  private parameterManager = new ParameterManager()

  getParameterManager() : ParameterManager {
    return this.parameterManager
  }

  configure(config: OperatorConfiguration): OrderByQueryBuilder<T> {
    return this;
  }

  addOrderBy(column: keyof T, direction: "DESC" | "ASC") {
    if (direction !== "DESC" && direction !== "ASC")
      throw new Error("Bad input");
    this.orderByStatements.push(`${column} ${direction}`);
    return this;
  }

  toSQL(): [string, Array<Primitive>] {
    // No order by statements
    if (this.orderByStatements.length === 0) {
      return ["", []];
    }
    
    return [` order by ${toArray(this.orderByStatements)}`, []];
  }
}

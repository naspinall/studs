import { ParameterManager } from "../common/ParameterManager";
import { NamedParameter, ParameterObject } from "../operators/NamedParameters";
import {
  OperatorConfiguration,
} from "../operators/Operator";

import { Primitive } from "../utility/types";

export class HavingQueryBuilder {
  private havingStatements: string[] = [];

  private parameterManager = new ParameterManager();

  configure(config: OperatorConfiguration): HavingQueryBuilder {
    this.parameterManager.configure({ count: config.count });
    return this;
  }

  having(SQLString: string, parameterObject: ParameterObject) {
    // And having are named parameters, allowing for any query to be written safely
    const namedParameter = new NamedParameter(SQLString, parameterObject);
    const [query] = namedParameter
      .configure({
        count: this.parameterManager.getParameterCount(),
      })
      .toSQL();

    this.havingStatements.push(query);
    this.parameterManager.merge(namedParameter.getParameterManager());
  }

  getParameterManager(): ParameterManager {
    return this.parameterManager;
  }

  toSQL(): [SQLString: string, parameters: Array<Primitive>] {
    // No having statements
    if (this.havingStatements.length === 0) {
      return ["", []];
    }

    return [
      ` having ${this.havingStatements.join(" and ")}`,
      this.parameterManager.getParameters(),
    ];
  }
}

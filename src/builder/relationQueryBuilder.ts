import { ParameterManager } from "../common/ParameterManager";
import { EntityMetadata } from "../metadata/metadata";
import { OperatorConfiguration } from "../operators/Operator";
import { Primitive } from "../utility/types";

interface Join {
  name: string;
  alias: string;
  type: "inner" | "left";
  condition?: string;
}

export class RelationQueryBuilder {
  private joins: Join[] = [];


  private parameterManager = new ParameterManager();

  getParameterManager() {
    return this.parameterManager;
  }

  configure(config: OperatorConfiguration): RelationQueryBuilder {
    this.parameterManager.configure({ count: config.count });
    return this;
  }

  leftJoin(entity: string, alias: string, condition: string) {
    this.joins.push({
      name: entity,
      type: "left",
      alias,
      condition,
    });
  }

  innerJoin(entity: string, alias: string, condition: string) {
    this.joins.push({
      name: entity,
      type: "inner",
      alias,
      condition,
    });
  }

  getJoins() {
    return this.joins;
  }

  getJoinsAliases() {
    return this.joins.map(({ alias }) => alias);
  }

  private buildJoin(join: Join): string {
    return ` ${join.type} join ${join.name} ${join.alias} on ( ${join.condition} )`;
  }

  toSQL(): [string, Array<Primitive>] {
    if (this.joins.length === 0) {
      return ["", []];
    }

    return [
      this.joins.reduce((SQLString, join) => {
        return SQLString + this.buildJoin(join);
      }, ""),
      [],
    ];
  }
}

import { ParameterManager } from "../common/ParameterManager";
import { Entity } from "../entity";
import { EntityMetadata, getMetadata } from "../metadata/metadata";
import { OperatorConfiguration } from "../operators/Operator";
import { escapeAllIdentifiers, escapeColumns } from "../utility/encoding";
import { Primitive } from "../utility/types";

type JoinType = "inner" | "left" | "outer" | "right";

interface Join {
  name: string;
  alias: string;
  type: JoinType;
  condition?: string;
}

interface Relation {
  metadata: EntityMetadata;
  alias: string;
}

export class RelationQueryBuilder {
  private joins: Join[] = [];
  private relations: Relation[] = [];

  private parameterManager = new ParameterManager();

  getParameterManager() {
    return this.parameterManager;
  }

  configure(config: OperatorConfiguration): RelationQueryBuilder {
    this.parameterManager.configure({ count: config.count });
    return this;
  }

   join(
    type: JoinType,
    entity: string | Entity<any>,
    alias: string,
    condition: string
  ) {
    if (typeof entity === "string")
      this.joins.push({
        name: entity,
        type : type || "inner",
        alias,
        condition,
      });
    else {
      const metadata = getMetadata(entity.name);
      this.relations.push({
        metadata,
        alias,
      });
      this.joins.push({
        name: `${metadata.schemaName}.${metadata.tableName}`,
        type : type || "inner",
        alias,
        condition,
      });
    }

    return this;
  }

  getJoins() {
    return this.joins;
  }

  getJoinsAliases() {
    return this.joins.map(({ alias }) => alias);
  }

  getRelationsAliases() {
    return this.relations.map(
      (relation) => relation.metadata.listPropertyColumns
    );
  }

  private buildJoin(join: Join): string {
    return ` ${join.type} join ${join.name} ${join.alias} on ( ${join.condition} )`;
  }

  escapeAllRelations(rawSQLString: string) {
    const columnEscaped = this.relations.reduce(
      (SQLString: string, relation: Relation) =>
        escapeColumns(SQLString, relation.alias, relation.metadata),
      rawSQLString
    );

    return this.joins.reduce(
      (SQLString: string, join: Join) =>
        escapeAllIdentifiers(SQLString, join.alias),
      columnEscaped
    );
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

import { getConnection } from "../connection/connection";
import { EntityMetadata } from "../metadata/metadata";
import { ParameterObject } from "../operators/NamedParameters";
import { escapeAllIdentifiers } from "../utility/encoding";
import { Primitive } from "../utility/types";
import { BaseQueryBuilder } from "./baseQueryBuilder";
import { WhereQueryBuilder } from "./whereQueryBuilder";

export class DeleteQueryBuilder<T> extends BaseQueryBuilder<T> {
  private whereBuilder = new WhereQueryBuilder();

  constructor(alias: string, metadata: EntityMetadata) {
    super(alias, metadata);
    this.alias = alias;
  }

  where(
    values: Partial<T> | string,
    parameters?: ParameterObject
  ): DeleteQueryBuilder<T> {
    if (typeof values === "string") return this.andWhere(values, parameters);
    this.whereBuilder
      .configure({
        alias: this.alias,
        metadata: this.metadata,
      })
      .where(values);
    return this;
  }

  andWhere(
    SQLString: string,
    parameterObject?: ParameterObject
  ): DeleteQueryBuilder<T> {
    this.whereBuilder.andWhere(SQLString, parameterObject);
    return this;
  }

  returning() {
    //this.returningColumns = addSelectColumns(columns, this.metadata);
    return this;
  }

  toSQL(): [string, Array<Primitive>] {
    const schema = this.metadata.schemaName;
    const tableName = this.metadata.tableName;

    const whereQuery = this.addFactory(this.whereBuilder);

    const rawSQLString =
      `delete from ${schema}.${tableName} as ${this.alias}` + whereQuery;

    const SQLString = escapeAllIdentifiers(
      rawSQLString,
      schema,
      tableName,
      this.alias,
      ...this.metadata.listDatabaseColumns()
    );

    return [SQLString, this.parameterManager.getParameters()];
  }

  async execute() {
    const [query, parameters] = this.toSQL();
    return await getConnection(this.connection).write(query, parameters);
  }
}

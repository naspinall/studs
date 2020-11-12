import { table } from "console";
import { ParameterManager } from "../common/ParameterManager";
import {
  escapeIdentifier,
  escapeLiteral,
  getConnection,
} from "../connection/connection";
import { EntityMetadata } from "../metadata/metadata";
import { ParameterObject } from "../operators/NamedParameters";
import { toArray } from "../utility/array";
import { escapeAllIdentifiers, escapeColumns } from "../utility/encoding";
import { returningColumnsToSQL, SelectColumn } from "../utility/select";
import { Primitive } from "../utility/types";
import { QueryBuilder } from "./queryBuilder";
import { SelectQueryBuilder } from "./selectQueryBuilder";
import { WhereQueryBuilder } from "./whereQueryBuilder";

export class UpdateQueryBuilder<T> extends QueryBuilder<T> {
  private updateValues!: Partial<T>;
  private selectQueryBuilder!: SelectQueryBuilder<any>;
  private returningColumns: SelectColumn[] = [];

  private setColumns: Array<string> = [];

  private whereBuilder = new WhereQueryBuilder();

  constructor(alias: string, metadata: EntityMetadata) {
    super(alias, metadata);
    this.alias = alias;
  }

  where(
    values: Partial<T> | string,
    parameters?: ParameterObject
  ): UpdateQueryBuilder<T> {
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
  ): UpdateQueryBuilder<T> {
    this.whereBuilder.andWhere(SQLString, parameterObject);
    return this;
  }

  values(values: Partial<T>) {
    this.updateValues = values;
    this.setColumns = Object.keys(values)
      //@ts-ignore
      .filter((key) => values[key] !== undefined)
      .map((column) => this.metadata.mapColumn(column));
    return this;
  }

  private toUpdateRows(): string {
    const rows = this.setColumns.map((key) =>
    //@ts-ignore
      this.parameterManager.addValue(this.updateValues?.[key])
    );

    //@ts-ignore
    return `${toArray(rows)}`;
  }

  returning() {
    //this.returningColumns = addSelectColumns(columns, this.metadata);
    return this;
  }

  toSQL(): [string, Array<Primitive>] {
    const schema = this.metadata.schemaName;
    const tableName = this.metadata.tableName;

    const returning = returningColumnsToSQL(this.returningColumns);

    const whereQuery = this.addFactory(this.whereBuilder);

    if (this.selectQueryBuilder) {
      const [selectSQL, parameters] = this.selectQueryBuilder.toSQL();
      return [`insert into ${schema}.${tableName} ${selectSQL}`, parameters];
    }

    const set = toArray(this.setColumns);

    const updateRow = this.toUpdateRows();
    const rawSQLString =
      this.setColumns.length > 1
        ? `update ${schema}.${tableName} as ${this.alias} set (${set}) = (${updateRow})` +
          whereQuery
        : `update ${schema}.${tableName} as ${this.alias} set ${set} = ${updateRow}` +
          whereQuery;
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

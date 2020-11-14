import {
  getConnection,
} from "../connection/connection";
import { EntityMetadata } from "../metadata/metadata";
import { ParameterObject } from "../operators/NamedParameters";
import { toArray } from "../utility/array";
import { escapeAllIdentifiers } from "../utility/encoding";
import { Primitive } from "../utility/types";
import { BaseQueryBuilder } from "./baseQueryBuilder";
import { ReturningQueryBuilder } from "./returningQueryBuilder";
import { SelectQueryBuilder } from "./selectQueryBuilder";
import { WhereQueryBuilder } from "./whereQueryBuilder";

interface UpdateExecuteOptions {
  transaction?: boolean;
}
export class UpdateQueryBuilder<T> extends BaseQueryBuilder<T> {
  private updateValues!: Partial<T>;
  private selectQueryBuilder!: SelectQueryBuilder<any>;

  private setColumns: Array<string> = [];

  private whereBuilder = new WhereQueryBuilder();
  private returningBuilder = new ReturningQueryBuilder();

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

  set(values: Partial<T>) {
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
    return this.setColumns.length > 1 ? `(${toArray(rows)})` : rows;
  }

  returning(...columns: (keyof T | "*")[]) {
    this.returningBuilder.returning(columns as Array<string>);
    return this;
  }

  toSQL(): [string, Array<Primitive>] {
    const schema = this.metadata.schemaName;
    const tableName = this.metadata.tableName;

    const whereQuery = this.addFactory(this.whereBuilder);
    const returningQuery = this.addFactory(this.returningBuilder);

    if (this.selectQueryBuilder) {
      const [selectSQL, parameters] = this.selectQueryBuilder.toSQL();
      return [`insert into ${schema}.${tableName} ${selectSQL}`, parameters];
    }

    const set =
      this.setColumns.length > 1
        ? `(${toArray(this.setColumns)})`
        : toArray(this.setColumns);

    const updateRow = this.toUpdateRows();
    const rawSQLString =
      `update ${schema}.${tableName} as ${this.alias} set ${set} = ${updateRow}` +
      whereQuery + returningQuery;
    const SQLString = escapeAllIdentifiers(
      rawSQLString,
      schema,
      tableName,
      this.alias,
      ...this.metadata.listDatabaseColumns(),
      ...this.metadata.listPropertyColumns()
    );

    return [SQLString, this.parameterManager.getParameters()];
  }

  async execute(options? : UpdateExecuteOptions) {
    const [query, parameters] = this.toSQL()
    if(options?.transaction === false) return await getConnection(this.connection).write(query, parameters);
    return await getConnection(this.connection).writeTransaction(query, parameters);
  }
}

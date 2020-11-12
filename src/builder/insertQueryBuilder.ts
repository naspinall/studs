import { table } from "console";
import { ParameterManager } from "../common/ParameterManager";
import {
  escapeIdentifier,
  escapeLiteral,
  getConnection,
} from "../connection/connection";
import { EntityMetadata } from "../metadata/metadata";
import { toArray } from "../utility/array";
import { escapeAllIdentifiers, escapeColumns } from "../utility/encoding";
import { returningColumnsToSQL, SelectColumn } from "../utility/select";
import { Primitive } from "../utility/types";
import { QueryBuilder } from "./queryBuilder";
import { SelectQueryBuilder } from "./selectQueryBuilder";

export class InsertQueryBuilder<T> extends QueryBuilder<T> {
  private insertValues: Array<Partial<T>> = [];
  private selectQueryBuilder!: SelectQueryBuilder<any>;
  private returningColumns: SelectColumn[] = [];

  

  constructor(alias: string, metadata: EntityMetadata) {
    super(alias, metadata);
    this.alias = alias;
  }

  values(values: Partial<T> | Array<Partial<T>>) {
    if (Array.isArray(values)) this.insertValues.push(...values);
    else this.insertValues.push(values);
    return this;
  }

  private toInsertRows(): string {
    const rows = this.insertValues
      .map((value) =>
        this.metadata.listPropertyColumns().map((key) => {
          //@ts-ignore
          if (value?.[key]) {
            //@ts-ignore
            return this.parameterManager.addValue(value?.[key]);
          } else if (this.metadata.isNullable(key)) return null;
          else return "DEFAULT";
        })
      )
      .map((row) => toArray(row));

    //@ts-ignore
    return toArray(rows, (input: Primitive) => `(${input})`);
  }

  select<K>(qb: SelectQueryBuilder<K>) {
    this.selectQueryBuilder = qb;
    return this;
  }

  returning() {
    //this.returningColumns = addSelectColumns(columns, this.metadata);
    return this;
  }

  toSQL(): [string, Array<Primitive>] {
    const schema = this.metadata.schemaName;
    const tableName = this.metadata.tableName;

    const returning = returningColumnsToSQL(this.returningColumns);

    if (this.selectQueryBuilder) {
      const [selectSQL, parameters] = this.selectQueryBuilder.toSQL();
      return [`insert into ${schema}.${tableName} ${selectSQL}`, parameters];
    }

    const values = toArray(this.metadata.listDatabaseColumns())

    const insertRows = this.toInsertRows();
    const rawSQLString = `insert into ${schema}.${tableName} (${values}) values ${insertRows}`;
    const SQLString = escapeAllIdentifiers(rawSQLString, schema, tableName, ...this.metadata.listDatabaseColumns());

    return [SQLString, this.parameterManager.getParameters()];
  }

  async execute() {
    const [query, parameters] = this.toSQL();
    return await getConnection(this.connection).write(query, parameters);
  }
}

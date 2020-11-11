import { escapeIdentifier, escapeLiteral } from "../connection/connection";
import { EntityMetadata } from "../metadata/metadata";
import { toArray } from "../utility/array";
import {
  returningColumnsToSQL,
  SelectColumn,
} from "../utility/select";
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
          if (value?.[key] as Primitive) {
            this.parameterCount++;
            //@ts-ignore
            this.parameters.push(value?.[key]);
            return `$${this.parameterCount}`;
          } else return "DEFAULT";
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
    const schema = escapeIdentifier("farm");
    const tableName = escapeIdentifier("houses");

    const returning = returningColumnsToSQL(this.returningColumns);

    if (this.selectQueryBuilder) {
      const [selectSQL, parameters] = this.selectQueryBuilder.toSQL();
      return [
        `insert into ${schema}.${tableName} ${selectSQL} returning ${returning}`,
        parameters,
      ];
    }

    const values = toArray(
      this.metadata.listDatabaseColumns(),
      (input: Primitive) => escapeLiteral(String(input))
    );

    const insertRows = this.toInsertRows();

    return [
      `insert into ${schema}.${tableName} values (${values}) values ${insertRows} returning ${returning}`,
      this.parameters,
    ];
  }
}

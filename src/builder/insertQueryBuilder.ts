import { getConnection } from "../connection/connection";
import { EntityMetadata } from "../metadata/metadata";
import { toArray } from "../utility/array";
import { escapeAllIdentifiers } from "../utility/encoding";
import { Primitive } from "../utility/types";
import { BaseQueryBuilder } from "./baseQueryBuilder";
import { OnConflictQueryBuilder } from "./onConflictQueryBuilder";
import { ReturningQueryBuilder } from "./returningQueryBuilder";
import { SelectQueryBuilder } from "./selectQueryBuilder";

interface InsertExecuteOptions {
  transaction?: boolean;
}

export class InsertQueryBuilder<T> extends BaseQueryBuilder<T> {
  private insertValues: Array<Partial<T>> = [];
  private selectQueryBuilder!: SelectQueryBuilder<any>;

  private returningBuilder = new ReturningQueryBuilder();
  private onConflictBuilder = new OnConflictQueryBuilder();

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

  returning(...columns: (keyof T | "*")[]) {
    this.returningBuilder.returning(columns as Array<string>);
    return this;
  }

  select<K>(qb: SelectQueryBuilder<K>) {
    this.selectQueryBuilder = qb;
    return this;
  }

  upsertOn(constraintColumn: keyof T) {
    this.onConflictBuilder.onConflictUpdate(
      constraintColumn as string,
      this.metadata.listPropertyColumns()
    );
    return this;
  }

  //TODO include this in the on conflict
  onConflict(conflictClause: string) {
    this.onConflictBuilder.setClause(conflictClause);
    return this;
  }

  toSQL(): [string, Array<Primitive>] {
    const schema = this.metadata.schemaName;
    const tableName = this.metadata.tableName;

    const returningQuery = this.addFactory(this.returningBuilder);
    const onConflictQuery = this.addFactory(this.onConflictBuilder);

    if (this.selectQueryBuilder) {
      const [selectSQL, parameters] = this.selectQueryBuilder.toSQL();
      return [`insert into ${schema}.${tableName} ${selectSQL}`, parameters];
    }

    const values = toArray(this.metadata.listDatabaseColumns());

    const insertRows = this.toInsertRows();
    const rawSQLString =
      `insert into ${schema}.${tableName} (${values}) values ${insertRows}` +
      onConflictQuery +
      returningQuery;
    const SQLString = escapeAllIdentifiers(
      rawSQLString,
      schema,
      tableName,
      ...this.metadata.listDatabaseColumns(),
      ...this.metadata.listPropertyColumns()
    );

    return [SQLString, this.parameterManager.getParameters()];
  }

  async execute(options?: InsertExecuteOptions) {
    const [query, parameters] = this.toSQL();
    if(options?.transaction === false) return await getConnection(this.connection).write(query, parameters);
    return await getConnection(this.connection).writeTransaction(query, parameters);
  }
}

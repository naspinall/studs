import { EntityMetadata } from "../metadata/metadata";
import { ParameterObject } from "../operators/NamedParameters";
import { escapeAllIdentifiers } from "../utility/encoding";
import { addSelectColumns, selectColumnsToSQL } from "../utility/select";
import { Primitive } from "../utility/types";
import { LimitQueryBuilder } from "./limitQueryBuilder";
import { OffsetQueryBuilder } from "./offsetQueryBuilder";
import { OrderByQueryBuilder } from "./orderByQueryBuilder";
import { QueryBuilder, QueryFactory } from "./queryBuilder";
import { WhereQueryBuilder } from "./whereQueryBuilder";

interface SelectColumn {
  databaseName: string;
  name: string;
}

export class SelectQueryBuilder<T> extends QueryBuilder<T> {
  private selectColumns: SelectColumn[] = [];

  private whereBuilder = new WhereQueryBuilder<T>();
  private limitBuilder = new LimitQueryBuilder();
  private offsetBuilder = new OffsetQueryBuilder();
  private orderByBuilder = new OrderByQueryBuilder<T>();

  constructor(alias: string, metadata: EntityMetadata<T>) {
    super(alias, metadata);
    this.alias = alias;
  }

  getParamCount() {
    return this.parameterCount;
  }

  select(...columns: (keyof T)[]): SelectQueryBuilder<T> {
    // Setting selection columns, mapping to database
    this.selectColumns = addSelectColumns(columns, this.metadata);
    return this;
  }

  addSelect(expression: string, alias: string) {
    this.selectColumns.push({
      databaseName: expression,
      name: alias,
    });
  }

  where(values: Partial<T>): SelectQueryBuilder<T> {
    console.log(this);
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
    parameterObject: ParameterObject
  ): SelectQueryBuilder<T> {
    this.whereBuilder.andWhere(SQLString, parameterObject);
    return this;
  }

  orderBy(column: keyof T, direction: "ASC" | "DESC") {
    this.orderByBuilder.addOrderBy(column, direction);
    return this;
  }

  limit(limit: number) {
    this.limitBuilder.setLimit(limit);
    return this;
  }

  offset(offset: number) {
    this.offsetBuilder.setOffset(offset);
    return this;
  }

  private addFactory(factory: QueryFactory<T>): string {
    const [query, parameters] = factory
      .configure({
        count: this.parameters.length,
        alias: this.alias,
        metadata: this.metadata,
      })
      .toSQL();
    this.parameters.push(...parameters);
    return query;
  }

  toSQL(): [string, Primitive[]] {
    const schema = this.metadata.schemaName;
    const tableName = this.metadata.tableName;

    const whereQuery = this.addFactory(this.whereBuilder);
    const orderByQuery = this.addFactory(this.orderByBuilder);
    const offsetQuery = this.addFactory(this.offsetBuilder);
    const limitQuery = this.addFactory(this.limitBuilder);

    const columns = selectColumnsToSQL(this.alias, this.selectColumns);

    const rawSQLString = `select ${columns} from ${schema}.${tableName} as ${this.alias} ${whereQuery} ${orderByQuery} ${offsetQuery} ${limitQuery}`.trimEnd();

    const SQLString = escapeAllIdentifiers(
      rawSQLString,
      schema,
      tableName,
      this.alias,
      ...Object.keys(this.metadata.mapper)
    );

    return [SQLString, this.parameters];
  }

  async execute() {
    const [query, parameters] = this.toSQL();
    const { rows } = await this.client.query(query, parameters);
    return rows;
  }
}

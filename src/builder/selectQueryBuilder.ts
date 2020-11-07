import { ParameterManager } from "../common/ParameterManager";
import { EntityMetadata } from "../metadata/metadata";
import { ParameterObject } from "../operators/NamedParameters";
import { OperatorConfiguration } from "../operators/Operator";
import { escapeAllIdentifiers } from "../utility/encoding";
import { addSelectColumns, selectColumnsToSQL } from "../utility/select";
import { Primitive } from "../utility/types";
import { GroupByQueryBuilder } from "./groupByQueryBuilder";
import { HavingQueryBuilder } from "./havingQueryBuilder";
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
  private havingBuilder = new HavingQueryBuilder();
  private limitBuilder = new LimitQueryBuilder();
  private offsetBuilder = new OffsetQueryBuilder();
  private orderByBuilder = new OrderByQueryBuilder<T>();
  private groupByBuilder = new GroupByQueryBuilder();

  private parameterManager = new ParameterManager();

  constructor(alias: string, metadata: EntityMetadata) {
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
    this.whereBuilder
      .configure({
        alias: this.alias,
        metadata: this.metadata,
      })
      .where(values);
    return this;
  }

  configure(config: OperatorConfiguration) {
    this.alias = config.alias || this.alias;
  }

  andWhere(
    SQLString: string,
    parameterObject: ParameterObject
  ): SelectQueryBuilder<T> {
    this.whereBuilder.andWhere(SQLString, parameterObject);
    return this;
  }

  groupBy(...conditions: Array<string>) {
    this.groupByBuilder.addGroupBy(conditions);
    return this;
  }
  having(
    SQLString: string,
    parameterObject: ParameterObject
  ): SelectQueryBuilder<T> {
    this.havingBuilder.having(SQLString, parameterObject);
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
        count: this.parameterManager.getParameterCount(),
        alias: this.alias,
        metadata: this.metadata,
      })
      .toSQL();
    this.parameterManager.merge(factory.getParameterManager());
    return query;
  }

  toSQL(): [string, Primitive[]] {
    const schema = this.metadata.schemaName;
    const tableName = this.metadata.tableName;

    const whereQuery = this.addFactory(this.whereBuilder);
    const orderByQuery = this.addFactory(this.orderByBuilder);
    const offsetQuery = this.addFactory(this.offsetBuilder);
    const limitQuery = this.addFactory(this.limitBuilder);
    const groupByQuery = this.addFactory(this.groupByBuilder);
    const havingQuery = this.addFactory(this.havingBuilder)

    const columns = selectColumnsToSQL(this.alias, this.selectColumns);

    const rawSQLString =
      `select ${columns} from ${schema}.${tableName} as ${this.alias}` +
      whereQuery +
      groupByQuery +
      havingQuery +
      orderByQuery +
      offsetQuery +
      limitQuery;

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

  async execute() {
    const [query, parameters] = this.toSQL();
    const { rows } = await this.client.query(query, parameters);
    return rows;
  }
}

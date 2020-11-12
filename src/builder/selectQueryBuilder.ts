import { ParameterManager } from "../common/ParameterManager";
import { getConnection } from "../connection/connection";
import { Entity } from "../entity";
import { EntityMetadata } from "../metadata/metadata";
import { ParameterObject } from "../operators/NamedParameters";
import { OperatorConfiguration } from "../operators/Operator";
import { toArray } from "../utility/array";
import { escapeAllIdentifiers, escapeColumns } from "../utility/encoding";
import { SelectColumn } from "../utility/select";
import { Primitive } from "../utility/types";
import { GroupByQueryBuilder } from "./groupByQueryBuilder";
import { HavingQueryBuilder } from "./havingQueryBuilder";
import { LimitQueryBuilder } from "./limitQueryBuilder";
import { OffsetQueryBuilder } from "./offsetQueryBuilder";
import { OrderByQueryBuilder } from "./orderByQueryBuilder";
import { QueryBuilder, QueryFactory } from "./queryBuilder";
import { RelationQueryBuilder } from "./relationQueryBuilder";
import { WhereQueryBuilder } from "./whereQueryBuilder";

interface SelectExpression {
  expression: string;
  alias?: string;
}

interface OrderByObject {
  [index: string]: "DESC" | "ASC";
}

const IsOrderBy = (check: any): check is OrderByObject =>
  Object.keys(check).every(
    (value) => check[value] === "ASC" || check[value] === "DESC"
  );

export class SelectQueryBuilder<T> extends QueryBuilder<T> {
  private selectColumns: Array<SelectColumn> = [];
  private selectExpressions: Array<SelectExpression> = [];
  
  private withQueries: Array<string> = [];

  private whereBuilder = new WhereQueryBuilder<T>();
  private havingBuilder = new HavingQueryBuilder();
  private limitBuilder = new LimitQueryBuilder();
  private offsetBuilder = new OffsetQueryBuilder();
  private orderByBuilder = new OrderByQueryBuilder<T>();
  private groupByBuilder = new GroupByQueryBuilder();
  private relationBuilder = new RelationQueryBuilder();

  

  constructor(alias: string, metadata: EntityMetadata) {
    super(alias, metadata);
  }

  getParamCount() {
    return this.parameterManager.getParameterCount();
  }

  select(...columns: (keyof T)[]): SelectQueryBuilder<T> {
    // Setting selection columns, mapping to database
    const selectExpressions: Array<SelectExpression> = columns.map((column) => {
      const databaseName = this.metadata.mapColumn(column as string);
      const expression = `${this.alias}.${databaseName}`;
      return {
        expression,
        alias: column as string,
      };
    });

    // Adding new select columns
    this.selectExpressions.push(...selectExpressions);
    return this;
  }

  addSelect(expression: string, alias: string) {
    this.selectExpressions.push({
      expression,
      alias,
    });
    return this;
  }

  selectExpressionToSQL(): string {
    const selectFormatter = (input: SelectExpression) =>
      input.alias ? `${input.expression} as ${input.alias}` : input.expression;
    return this.selectExpressions.length === 0
      ? "*"
      : toArray(this.selectExpressions, selectFormatter);
  }

  selectColumnsToSQL(): string {
    const selectFormatter = (input: SelectColumn) =>
      input.expression
        ? `${input.expression} as ${input.columnAlias}`
        : `${this.alias}.${input.databaseName} as ${input.columnAlias}`;
    return this.selectColumns.length === 0 &&
      this.selectExpressions.length === 0
      ? "*"
      : toArray(this.selectColumns, selectFormatter);
  }

  leftJoin(
    entity: Entity<any>,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;
  leftJoin(
    tableName: string,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;

  leftJoin(entity: string | Entity<any>, alias: string, condition: string) {
    if (typeof entity === "string")
      this.relationBuilder.join("left", entity, alias, condition);
    else this.relationBuilder.join("left", entity, alias, condition);
    return this;
  }

  innerJoin(
    entity: Entity<any>,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;
  innerJoin(
    tableName: string,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;

  innerJoin(entity: string | Entity<any>, alias: string, condition: string) {
    if (typeof entity === "string")
      this.relationBuilder.join("inner", entity, alias, condition);
    else this.relationBuilder.join("inner", entity, alias, condition);
    return this;
  }

  rightJoin(
    entity: Entity<any>,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;
  rightJoin(
    tableName: string,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;

  rightJoin(entity: string | Entity<any>, alias: string, condition: string) {
    if (typeof entity === "string")
      this.relationBuilder.join("right", entity, alias, condition);
    else this.relationBuilder.join("right", entity, alias, condition);
    return this;
  }

  leftJoinAndSelect(
    entity: Entity<any>,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;
  leftJoinAndSelect(
    tableName: string,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;

  leftJoinAndSelect(
    entity: string | Entity<any>,
    alias: string,
    condition: string
  ) {
    this.selectExpressions.push({
      expression: `${alias}.*`,
    });
    if (typeof entity === "string")
      this.relationBuilder.join("left", entity, alias, condition);
    else this.relationBuilder.join("left", entity, alias, condition);
    return this;
  }

  innerJoinAndSelect(
    entity: Entity<any>,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;
  innerJoinAndSelect(
    tableName: string,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;

  innerJoinAndSelect(
    entity: string | Entity<any>,
    alias: string,
    condition: string
  ) {
    this.selectExpressions.push({
      expression: `${alias}.*`,
    });
    if (typeof entity === "string")
      this.relationBuilder.join("inner", entity, alias, condition);
    else this.relationBuilder.join("inner", entity, alias, condition);
    return this;
  }

  rightJoinAndSelect(
    entity: Entity<any>,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;
  rightJoinAndSelect(
    tableName: string,
    alias: string,
    condition: string
  ): SelectQueryBuilder<T>;

  rightJoinAndSelect(
    entity: string | Entity<any>,
    alias: string,
    condition: string
  ) {
    this.selectExpressions.push({
      expression: `${alias}.*`,
    });
    if (typeof entity === "string")
      this.relationBuilder.join("right", entity, alias, condition);
    else this.relationBuilder.join("right", entity, alias, condition);
    return this;
  }

  where(
    values: Partial<T> | string,
    parameters?: ParameterObject
  ): SelectQueryBuilder<T> {
    if (typeof values === "string") return this.andWhere(values, parameters);
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
    parameterObject?: ParameterObject
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

  orderBy(column: keyof T, direction: "ASC" | "DESC"): SelectQueryBuilder<T>;
  orderBy(orderBys: keyof T | OrderByObject): SelectQueryBuilder<T>;

  orderBy(column: keyof T | OrderByObject, direction?: "ASC" | "DESC") {
    if (IsOrderBy(column))
      Object.entries(column).forEach(([column, direction]) => {
        this.orderByBuilder.addOrderBy(column as keyof T, direction);
      });
    else this.orderByBuilder.addOrderBy(column, direction || "DESC");
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

  // Order matters for now.
  with(subQuery: SelectQueryBuilder<T>, alias: string) {
    this.parameterManager.configure({ count: subQuery.getParamCount() });
    const [subQuerySQL] = subQuery.toSQL();
    //this.whereStatements.push(`${alias} as ( ${subQuerySQL} )`);
  }

  private getAliases(): Array<string> {
    const aliases = [
      this.metadata.schemaName,
      this.metadata.tableName,
      this.alias,
      ...this.metadata.listDatabaseColumns(),
      ...(this.selectExpressions
        .map(({ alias }) => alias)
        .filter((alias) => alias) as Array<string>),
    ];

    return aliases;
  }

  toSQL(): [string, Primitive[]] {
    const schema = this.metadata.schemaName;
    const tableName = this.metadata.tableName;

    const whereQuery = this.addFactory(this.whereBuilder);
    const joinQuery = this.addFactory(this.relationBuilder);
    const orderByQuery = this.addFactory(this.orderByBuilder);
    const offsetQuery = this.addFactory(this.offsetBuilder);
    const limitQuery = this.addFactory(this.limitBuilder);
    const groupByQuery = this.addFactory(this.groupByBuilder);
    const havingQuery = this.addFactory(this.havingBuilder);

    const columns = this.selectExpressionToSQL();

    const rawSQLString =
      `select ${columns} from ${schema}.${tableName} as ${this.alias}` +
      whereQuery +
      joinQuery +
      groupByQuery +
      havingQuery +
      orderByQuery +
      offsetQuery +
      limitQuery;

    let SQLString = escapeColumns(rawSQLString, this.alias, this.metadata);
    SQLString = this.relationBuilder.escapeAllRelations(SQLString);
    SQLString = escapeAllIdentifiers(SQLString, ...this.getAliases());

    return [SQLString, this.parameterManager.getParameters()];
  }

  async execute() {
    const [query, parameters] = this.toSQL();
    return await getConnection(this.connection).read(query, parameters);
  }
}

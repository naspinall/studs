import { EntityMetadata } from "../metadata/metadata";
import { Equal } from "../operators/Equal";
import { NamedParameter, ParameterObject } from "../operators/NamedParameters";
import {
  isSelectOperator,
  OperatorConfiguration,
  SelectOperator,
} from "../operators/Operator";
import { joinWhere } from "../utility/array";
import { Primitive } from "../utility/types";

export class WhereQueryBuilder<T> {
  private whereStatements: string[] = [];
  private parameters: Primitive[] = [];
  private parameterCount = 0;
  private alias!: string;
  private metadata!: EntityMetadata<T>;

  protected buildWhere(): string {
    // No where statements
    if (this.whereStatements.length === 0) {
      return "";
    }

    return `where${joinWhere(this.whereStatements)}`;
  }

  configure(config: OperatorConfiguration<T>): WhereQueryBuilder<T> {
    this.parameterCount = config.count || 0;
    this.alias = config.alias || "";
    this.metadata = config.metadata || ({} as EntityMetadata<T>);
    return this;
  }

  where(values: Partial<T>): void {
    const whereKeys = Object.keys(values);

    for (const whereKey of whereKeys) {
      //@ts-ignore
      const databaseColumn = this.metadata.mapper[whereKey]?.name;

      //@ts-ignore
      const operator = values[whereKey];

      if (isSelectOperator<T>(operator)) {
        this.addOperator(databaseColumn, operator);
        continue;
      }

      //@ts-ignore
      const value = values[whereKey] as Primitive;

      this.addOperator(databaseColumn, Equal(value));
    }
  }

  andWhere(SQLString: string, parameterObject: ParameterObject) {
    // And where are named parameters, allowing for any query to be written safely
    const namedParameter = new NamedParameter(SQLString, parameterObject);
    const [query, parameters] = namedParameter
      .configure({
        count: this.parameterCount,
      })
      .toSQL();

    this.whereStatements.push(query);

    this.parameterCount += namedParameter.getParamCount();

    this.parameters.push(...parameters);
  }

  private addOperator(column: string, operator: SelectOperator<T>) {
    // Getting SQL
    const [query, value] = operator
      .configure({
        count: this.parameterCount,
        alias: `${this.alias}.${column}`,
      })
      .toSQL();

    // Adding where statement
    this.whereStatements.push(query);

    // Incrementing parameter count
    this.parameterCount += operator.getParamCount();

    // Adding value to list of parameters
    Array.isArray(value)
      ? this.parameters.push(...value)
      : this.parameters.push(value);
  }

  toSQL(): [SQLString: string, parameters: Array<Primitive>] {
    // No where statements
    if (this.whereStatements.length === 0) {
      return ["", []];
    }

    return [`where ${joinWhere(this.whereStatements)}`, this.parameters];
  }
}

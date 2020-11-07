import { ParameterManager } from "../common/ParameterManager";
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

  private alias!: string;
  private metadata!: EntityMetadata;

  private parameterManager = new ParameterManager();

  configure(config: OperatorConfiguration): WhereQueryBuilder<T> {
    this.parameterManager.configure({count : config.count})
    this.alias = config.alias || "";
    this.metadata = config.metadata || ({} as EntityMetadata);
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
    const [query] = namedParameter
      .configure({
        count: this.parameterManager.getParameterCount(),
      })
      .toSQL();

    this.whereStatements.push(query);
    this.parameterManager.merge(namedParameter.getParameterManager());
  }

  getParameterManager(): ParameterManager {
    return this.parameterManager;
  }

  private addOperator(column: string, operator: SelectOperator<T>) {
    // Getting SQL
    const [query, value] = operator
      .configure({
        metadata: this.metadata,
        count: this.parameterManager.getParameterCount(),
        alias: this.alias,
        column,
      })
      .toSQL();

    // Adding where statement
    this.whereStatements.push(query);

    this.parameterManager.merge(operator.getParameterManager());
  }

  toSQL(): [SQLString: string, parameters: Array<Primitive>] {
    // No where statements
    if (this.whereStatements.length === 0) {
      return ["", []];
    }

    return [
      ` where ${joinWhere(this.whereStatements)}`,
      this.parameterManager.getParameters(),
    ];
  }
}

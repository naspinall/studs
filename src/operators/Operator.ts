import { ParameterManager } from "../common/ParameterManager";
import { EntityMetadata } from "../metadata/metadata";
import { toSQLValue } from "../utility/encoding";
import { Primitive } from "../utility/types";

export interface OperatorConfiguration {
  count?: number;
  alias?: string;
  column?: string;
  metadata?: EntityMetadata;
}

export interface SelectOperator<T> {
  configure(configuration: OperatorConfiguration): SelectOperator<T>;
  getParameterManager(): ParameterManager;
  toSQL(): [string, Array<Primitive>];
}

export const isSelectOperator = <T>(
  operator: any
): operator is SelectOperator<T> => {
  return (
    (operator as SelectOperator<T>).toSQL !== undefined &&
    (operator as SelectOperator<T>).configure !== undefined
  );
};

export const isSelectOperatorArray = <T>(
  operator: Array<any>
): operator is Array<SelectOperator<T>> => {
  return operator.some((value) => isSelectOperator(value));
};

export abstract class Operator<T> implements SelectOperator<T> {
  protected metadata!: EntityMetadata;
  protected column!: string;
  protected alias!: string;
  protected parameterCount!: number;
  protected parameterManager: ParameterManager = new ParameterManager();

  configure(config: OperatorConfiguration): Operator<T> {
    this.parameterManager.configure({ count: config.count });
    this.metadata = config.metadata || ({} as EntityMetadata);
    this.column = config.column || "";
    this.alias = config.alias || "";
    return this;
  }

  getParamCount(): number {
    return this.parameterCount;
  }

  getParameterManager(): ParameterManager {
    return this.parameterManager;
  }

  getSQLValue(value: Primitive): string;
  getSQLValue(value: Array<Primitive>): Array<string>;

  getSQLValue(value: Primitive | Array<Primitive>): string | Array<string> {
    const SQLType = this.metadata.getSQLType(this.column);
    if (Array.isArray(value))
      return value.map((value) => toSQLValue(value, SQLType));
    else return toSQLValue(value, SQLType);
  }

  abstract toSQL(): [string, Array<Primitive>];
}

import { EntityMetadata } from "../metadata/metadata";
import { Primitive } from "../utility/types";

export interface OperatorConfiguration<T> {
  count?: number;
  alias?: string;
  metadata?: EntityMetadata<T>;
}

export interface SelectOperator<T> {
  configure(configuration: OperatorConfiguration<T>): SelectOperator<T>;
  getParamCount(): number;
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
  protected column!: string;
  protected parameterCount!: number;

  configure(config: OperatorConfiguration<T>): Operator<T> {
    this.column = config.alias || "";
    this.parameterCount = config.count || 0;
    return this;
  }

  getParamCount(): number {
    return this.parameterCount;
  }

  abstract toSQL(): [string, Array<Primitive>];
}

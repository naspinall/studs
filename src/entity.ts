import { QueryBuilder } from "./builder/queryBuilder";
import { Primitive } from "./utility/types";

export interface Entity<T> {
  new (): T;
  [index: string]: any;
}

export type PartialEntity<T extends Entity<T>> = Partial<T>;

export class BaseEntity {
  static createQueryBuilder<T extends BaseEntity>(this: Entity<T>) {
    return new QueryBuilder(this);
  }
}

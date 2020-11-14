import { QueryBuilder } from "./builder/queryBuilder";

export interface Entity<T> {
  new (): T;
}

export type PartialEntity<T extends Entity<T>> = Partial<T>;

export class BaseEntity {
  static createQueryBuilder<T extends BaseEntity>(
    this: Entity<T>  ) {
    return new QueryBuilder(this);
  }
}

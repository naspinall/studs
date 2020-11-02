import { InsertQueryBuilder } from "./builder/insertQueryBuilder";
import { SelectQueryBuilder } from "./builder/selectQueryBuilder";
import { getMetadata } from "./metadata/metadata";
import { toLowercase } from "./utility/array";
import { Primitive } from "./utility/types";

export type ClassType<T> = { new (): T };
export type Entity<T> = { [K in keyof T]: Primitive };
export type PartialEntity<T extends Entity<T>> = Partial<T>;

export class BaseEntity {
  static createSelectQueryBuilder<T extends BaseEntity>(
    this: ClassType<T>,
    alias?: string
  ) {
    const metadata = getMetadata<T>(this.name);
    return new SelectQueryBuilder<T>(alias || toLowercase(this.name), metadata);
  }

  static createInsertQueryBuilder<T extends BaseEntity>(
    this: ClassType<T>,
    alias?: string
  ) {
    const metadata = getMetadata<T>(this.name);
    return new InsertQueryBuilder<T>(alias || toLowercase(this.name), metadata);
  }
}

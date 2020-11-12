import { DeleteQueryBuilder } from "./builder/deleteQueryBuilder";
import { InsertQueryBuilder } from "./builder/insertQueryBuilder";
import { SelectQueryBuilder } from "./builder/selectQueryBuilder";
import { UpdateQueryBuilder } from "./builder/updateQueryBuilder";
import { getMetadata } from "./metadata/metadata";
import { toLowercase } from "./utility/array";

export interface Entity<T> {
  new (): T;
}

export type PartialEntity<T extends Entity<T>> = Partial<T>;

export class BaseEntity {
  static createSelectQueryBuilder<T extends BaseEntity>(
    this: Entity<T>,
    alias?: string
  ) {
    const metadata = getMetadata<T>(this.name);
    return new SelectQueryBuilder<T>(alias || toLowercase(this.name), metadata);
  }

  static createInsertQueryBuilder<T extends BaseEntity>(
    this: Entity<T>,
    alias?: string
  ) {
    const metadata = getMetadata<T>(this.name);
    return new InsertQueryBuilder<T>(alias || toLowercase(this.name), metadata);
  }

  static createUpdateQueryBuilder<T extends BaseEntity>(
    this: Entity<T>,
    alias?: string
  ) {
    const metadata = getMetadata<T>(this.name);
    return new UpdateQueryBuilder<T>(alias || toLowercase(this.name), metadata);
  }
  static createDeleteQueryBuilder<T extends BaseEntity>(
    this: Entity<T>,
    alias?: string
  ) {
    const metadata = getMetadata<T>(this.name);
    return new DeleteQueryBuilder<T>(alias || toLowercase(this.name), metadata);
  }
}

import { QueryBuilder } from "./builder/queryBuilder";
import { getConnection } from "./connection/connection";
import { getMetadata } from "./metadata/metadata";

export interface Entity<T> {
  new (): T;
  [index: string]: any;
}

export type PartialEntity<T extends Entity<T>> = Partial<T>;

export class BaseEntity {
  static createQueryBuilder<T extends BaseEntity>(this: Entity<T>) {
    return new QueryBuilder(this);
  }

  static async truncate<T extends BaseEntity>(this: Entity<T>) {
    const metadata = getMetadata(this);
    await getConnection().write(
      `truncate ${metadata.schemaName}.${metadata.tableName}`,
      []
    );
  }
}

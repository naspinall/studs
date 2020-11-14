import { Client } from "pg";
import { ParameterManager } from "../common/ParameterManager";
import { Entity } from "../entity";
import { EntityMetadata, getMetadata } from "../metadata/metadata";
import { OperatorConfiguration } from "../operators/Operator";
import { toLowercase } from "../utility/array";

import { Primitive } from "../utility/types";
import { DeleteQueryBuilder } from "./deleteQueryBuilder";
import { InsertQueryBuilder } from "./insertQueryBuilder";
import { SelectQueryBuilder } from "./selectQueryBuilder";
import { UpdateQueryBuilder } from "./updateQueryBuilder";

export interface QueryFactory<T> {
  getParameterManager(): ParameterManager;
  toSQL(): [string, Array<Primitive>];
  configure(config: OperatorConfiguration): QueryFactory<T>;
}

export class QueryBuilder<T> {
  private entity: Entity<T>;
  constructor(entity: Entity<T>) {
    this.entity = entity;
  }

  select(alias?: string): SelectQueryBuilder<T> {
    const metadata = getMetadata<T>(this.entity.name);
    return new SelectQueryBuilder<T>(
      alias || toLowercase(this.entity.name),
      metadata
    );
  }
  insert(alias?: string): InsertQueryBuilder<T> {
    const metadata = getMetadata<T>(this.entity.name);
    return new InsertQueryBuilder<T>(
      alias || toLowercase(this.entity.name),
      metadata
    );
  }
  update(alias?: string): UpdateQueryBuilder<T> {
    const metadata = getMetadata<T>(this.entity.name);
    return new UpdateQueryBuilder<T>(
      alias || toLowercase(this.entity.name),
      metadata
    );
  }

  delete(alias?: string): DeleteQueryBuilder<T> {
    const metadata = getMetadata<T>(this.entity.name);
    return new DeleteQueryBuilder<T>(
      alias || toLowercase(this.entity.name),
      metadata
    );
  }
}

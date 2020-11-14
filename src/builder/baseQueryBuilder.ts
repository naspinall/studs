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

export class BaseQueryBuilder<T> {
  protected metadata: EntityMetadata;

  protected alias!: string;
  protected connection!: string;
  protected parameterManager = new ParameterManager();

  constructor(alias: string, metadata: EntityMetadata) {
    this.alias = alias;
    this.metadata = metadata;
  }

  protected addFactory(factory: QueryFactory<T>): string {
    const [query] = factory
      .configure({
        count: this.parameterManager.getParameterCount(),
        alias: this.alias,
        metadata: this.metadata,
      })
      .toSQL();
    this.parameterManager.merge(factory.getParameterManager());
    return query;
  }
}
import { Client } from "pg";
import { ParameterManager } from "../common/ParameterManager";
import { EntityMetadata } from "../metadata/metadata";
import { OperatorConfiguration } from "../operators/Operator";

import { Primitive } from "../utility/types";

export interface QueryFactory<T> {
  getParameterManager(): ParameterManager;
  toSQL(): [string, Array<Primitive>];
  configure(config: OperatorConfiguration): QueryFactory<T>;
}

export class QueryBuilder<T> {
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

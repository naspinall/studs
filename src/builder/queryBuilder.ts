import { Client } from "pg";
import { ParameterManager } from "../common/ParameterManager";
import { EntityMetadata } from "../metadata/metadata";
import { OperatorConfiguration } from "../operators/Operator";
import { joinWhere } from "../utility/array";
import { Primitive } from "../utility/types";

export interface QueryFactory<T> {
  getParameterManager() : ParameterManager
  toSQL(): [string, Array<Primitive>];
  configure(config: OperatorConfiguration): QueryFactory<T>;
}

export class QueryBuilder<T> {
  protected metadata: EntityMetadata;

  protected client!: Client;
  protected alias!: string;

  protected whereStatements: string[] = [];
  protected parameters: Primitive[] = [];
  protected parameterCount = 0;

  constructor(alias: string, metadata: EntityMetadata) {
    this.alias = alias;
    this.metadata = metadata;
  }
}

import { Client } from "pg";
import { EntityMetadata } from "../metadata/metadata";
import { OperatorConfiguration } from "../operators/Operator";
import { joinWhere } from "../utility/array";
import { Primitive } from "../utility/types";

export interface QueryFactory<T> {
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

  protected buildWhere(): string {
    // No where statements
    if (this.whereStatements.length === 0) {
      return "";
    }

    return `where${joinWhere(this.whereStatements)}`;
  }
}

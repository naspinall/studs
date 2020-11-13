import { ParameterManager } from "../common/ParameterManager";
import { EntityMetadata } from "../metadata/metadata";
import { OperatorConfiguration } from "../operators/Operator";
import { Primitive } from "../utility/types";

export class ReturningQueryBuilder {
  private parameterManager = new ParameterManager();
  private returningColumns: Array<string> = [];
  private metadata!: EntityMetadata;

  getParameterManager(): ParameterManager {
    return this.parameterManager;
  }

  configure(config: OperatorConfiguration): ReturningQueryBuilder {
    this.metadata = config.metadata as EntityMetadata;
    return this;
  }

  returning(columns: Array<string>) {
    this.returningColumns.push(...columns);
  }

  toSQL(): [string, Array<Primitive>] {
    const [firstElement] = this.returningColumns;
    if (firstElement === "*") return [" returning *", []];
    else if (this.returningColumns.length > 0) {
      return [
        " returning " + this.returningColumns
          .map((column) => `${this.metadata.mapColumn(column)} as ${column}`)
          .join(", "),
        [],
      ];
    } else return ["", []];
  }
}

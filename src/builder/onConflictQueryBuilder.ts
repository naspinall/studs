import { ParameterManager } from "../common/ParameterManager";
import { EntityMetadata } from "../metadata/metadata";
import { OperatorConfiguration } from "../operators/Operator";
import { Primitive } from "../utility/types";

export class OnConflictQueryBuilder {
  private parameterManager = new ParameterManager();
  private updateColumns: Array<string> = [];
  private constraintColumn!: string;
  private metadata!: EntityMetadata;
  private clause!: string;

  getParameterManager(): ParameterManager {
    return this.parameterManager;
  }

  configure(config: OperatorConfiguration): OnConflictQueryBuilder {
    this.metadata = config.metadata as EntityMetadata;
    return this;
  }

  onConflictUpdate(constraintColumn: string, columns: Array<string>) {
    this.constraintColumn = constraintColumn;
    this.updateColumns.push(...columns);
  }

  setClause(conflictClause: string) {
    this.clause = conflictClause;
  }

  toSQL(): [string, Array<Primitive>] {
    if (this.updateColumns.length > 0)
      return [
        ` on conflict (${this.metadata.mapColumn(
          this.constraintColumn
        )}) do update set ` +
          this.updateColumns
            .map((column) => {
              const databaseColumn = this.metadata.mapColumn(column);
              return `${databaseColumn} = EXCLUDED.${databaseColumn}`;
            })
            .join(", "),
        [],
      ];
    else if (this.clause) return [` on conflict ${this.clause}`, []];
    else return ["", []];
  }
}

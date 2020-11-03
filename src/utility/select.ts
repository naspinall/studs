import { escapeIdentifier } from "../connection/connection";
import { EntityMetadata } from "../metadata/metadata";
import { toArray } from "./array";

export interface SelectColumn {
  databaseName: string;
  name: string;
}
export const addSelectColumns = <T>(
  columns: (keyof T)[],
  metadata: EntityMetadata
) =>
  columns.map((column) => ({
    databaseName: metadata.mapColumn(column as string),
    name: column as string,
  }));

export const selectColumnsToSQL = (alias: string, columns: SelectColumn[]) => {
  const selectFormatter = (input: SelectColumn) =>
    `${alias}.${input.databaseName} as ${input.name}`;
  return columns.length === 0 ? "*" : toArray(columns, selectFormatter);
};

export const returningColumnsToSQL = (columns: SelectColumn[]) => {
  const selectFormatter = (input: SelectColumn) =>
    `${input.databaseName} as ${escapeIdentifier(input.name)}`;
  return columns.length === 0 ? "*" : toArray(columns, selectFormatter);
};

export const escapeAliasAndColumn = (alias: string, column: string) =>
  `${escapeIdentifier(alias)}.${escapeIdentifier(column)}`;

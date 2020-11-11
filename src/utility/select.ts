import { escapeIdentifier } from "../connection/connection";
import { EntityMetadata } from "../metadata/metadata";
import { toArray } from "./array";

export interface SelectColumn {
  databaseName?: string;
  columnAlias: string;
  expression?: string;
}

export const returningColumnsToSQL = (columns: SelectColumn[]) => {
  const selectFormatter = (input: SelectColumn) =>
    `${input.databaseName} as ${escapeIdentifier(input.columnAlias)}`;
  return columns.length === 0 ? "*" : toArray(columns, selectFormatter);
};

export const escapeAliasAndColumn = (alias: string, column: string) =>
  `${escapeIdentifier(alias)}.${escapeIdentifier(column)}`;

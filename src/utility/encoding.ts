import { stringify } from "querystring";
import { escapeIdentifier, escapeLiteral } from "../connection/connection";
import { EntityMetadata } from "../metadata/metadata";
import { Primitive } from "./types";

export type PostgresType =
  | "boolean"
  | "bigint"
  | "int"
  | "integer"
  | "timestamptz"
  | "varchar"
  | "text";

export type StudsType = "boolean" | "string" | "number" | "date";

export const toSQLValue = (value: Primitive, type: PostgresType): string => {
  switch (type) {
    case "boolean":
      return String(Boolean(value));
    case "bigint":
      return String(value);
    case "integer":
      return String(value);
    case "int":
      return String(value);
    case "timestamptz":
      return String((value as Date)?.toISOString());
    case "varchar":
      return escapeLiteral(String(value));
    case "text":
      return escapeLiteral(String(value));
    default:
      throw new Error("Bad Type");
  }
};

export const fromSQLValue = (value: Primitive, type: StudsType) => {
  switch (type) {
    case "boolean":
      return Boolean(value);
    case "string":
      return String(value);
    case "number":
      return Number(value);
    case "date":
      return new Date(String(value));
  }
};

// Escapes provided identifiers in a given SQL string
export const escapeColumns = (
  SQLString: string,
  alias: string,
  entityMetadata: EntityMetadata
) =>
  entityMetadata
    .listPropertyColumns()
    .reduce(
      (currentSql: string, propertyColumn: string) =>
        currentSql.replace(
          new RegExp(
            `("|\\b)("?${alias}"?\\."?${propertyColumn}"?)("|\\b)`,
            "g"
          ),
          `$1${escapeIdentifier(alias)}.${escapeIdentifier(
            entityMetadata.mapColumn(propertyColumn)
          )}$3`
        ),
      SQLString
    );

// Escapes provided identifiers in a given SQL string
export const escapeAllIdentifiers = (
  SQLString: string,
  ...identifiers: Array<string>
) =>
  // Splitting on single quotes to get to prevent string literals in the query from being escaped
  SQLString.split("'")
    .map((splitSQL, index) =>
      // Only escape on odd, queries won't start with a string literal
      index % 2 === 0
        ? // Use regex to replace all the identifiers in SQL
          identifiers.reduce(
            (currentSQL: string, identifier: string) =>
              currentSQL.replace(
                new RegExp(`("|\\b)(${identifier})("|\\b)`, "g"),
                `${escapeIdentifier(identifier)}`
              ),
            splitSQL
          )
        : // Just returning string literal
          splitSQL
    )
    // Joining string back together
    .join("'");

import { escapeIdentifier } from "../connection/connection";
import { Primitive } from "./types";

export type PostgresType =
  | "boolean"
  | "bigint"
  | "integer"
  | "timestamptz"
  | "varchar"
  | "text";

export const encodeValue = (value: Primitive, type: PostgresType): string => {
  switch (type) {
    case "boolean":
      return String(Boolean(value));
    case "bigint":
      return String(value);
    case "integer":
      return String(value);
    case "timestamptz":
      return String((value as Date)?.toISOString());
    case "varchar":
      return `${"String(value)"}`;
    case "text":
      return `${"String(value)"}`;
  }
};

// Escapes provided identifiers in a given SQL string
export const escapeAllIdentifiers = (
  SQLString: string,
  ...identifiers: Array<string>
) =>
  identifiers.reduce(
    (currentSql: string, identifier: string) =>
      currentSql.replace(
        new RegExp(`"?${identifier}"?`, "g"),
        escapeIdentifier(identifier)
      ),
    SQLString
  );

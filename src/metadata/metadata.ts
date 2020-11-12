import { Entity } from "../entity";
import { toLowercase } from "../utility/array";
import {
  fromSQLValue,
  PostgresType,
  StudsType,
  toSQLValue,
} from "../utility/encoding";
import { Primitive } from "../utility/types";

const metadata: Metadata = {};

interface ObjectType {
  [index: string]: Primitive;
}

interface Metadata {
  [index: string]: EntityMetadata;
}

export type MapperValue = {
  name: string;
  type: StudsType;
  databaseType: PostgresType;
  nullable: boolean;
};

type Mapper = {
  [index: string]: MapperValue;
};

interface InverseMapper {
  [index: string]: MapperValue;
}
interface AddColumnOptions {
  nullable?: boolean;
}
export class EntityMetadata {
  tableName!: string;
  schemaName!: string;
  name: string;
  private mapper: Mapper = {};
  private inverseMapper: InverseMapper = {};

  constructor(name: string) {
    this.name = name;
  }

  setTableName(tableName: string) {
    this.tableName = tableName;
  }
  setSchemaName(schemaName: string) {
    this.schemaName = schemaName;
  }

  addColumn(
    propertyColumn: string,
    databaseColumn: string,
    type: StudsType,
    databaseType: PostgresType,
    options?: AddColumnOptions
  ) {
    this.mapper[propertyColumn] = {
      type,
      name: databaseColumn,
      databaseType,
      nullable: options?.nullable || false,
    };

    this.inverseMapper[databaseColumn] = {
      type,
      name: propertyColumn,
      databaseType,
      nullable: options?.nullable || false,
    };
  }

  map(propertyColumn: string, value: Primitive) {
    const { databaseType, name } = this.mapper[propertyColumn];
    return { name, value: toSQLValue(value, databaseType) };
  }

  inverseMap(databaseColumn: string, value: Primitive) {
    const { type, name } = this.inverseMapper[databaseColumn];
    return { name, value: fromSQLValue(value, type) };
  }

  inverseMapAll(rawRows: Array<ObjectType>) {
    rawRows.map((rawRow) => {
      const row: ObjectType = {};
      Object.entries(rawRow).forEach((entry) => {
        const [databaseColumn, rawValue] = entry;
        const { name, value } = this.inverseMap(databaseColumn, rawValue);
        row[name] = value;
      });
    });
  }

  mapColumn(propertyColumn: string) {
    const { name } = this.mapper[propertyColumn];
    return name;
  }

  inverseMapColumn(databaseColumn: string) {
    const { name } = this.inverseMapper[databaseColumn];
    return name;
  }

  listPropertyColumns() {
    return Object.keys(this.mapper);
  }

  listDatabaseColumns() {
    return Object.keys(this.inverseMapper);
  }

  getSQLType(column: string) {
    return this.mapper[column].databaseType;
  }

  getStudsType(column: string) {
    return this.mapper[column].type;
  }

  isNullable(column: string) {
    return this.mapper[column].nullable;
  }
}

export const getMetadata = <T>(entity: Entity<T> | string): EntityMetadata => {
  if (typeof entity === "string") {
    return metadata[entity];
  }
  return metadata[entity.constructor.name];
};

export const addColumn = (
  name: string,
  databaseColumn: string,
  propertyColumn: string,
  type: StudsType,
  databaseType: PostgresType,
  options?: AddColumnOptions
) => {
  if (!metadata[name]) metadata[name] = new EntityMetadata(name);
  metadata[name].addColumn(
    propertyColumn,
    databaseColumn,
    type,
    databaseType,
    options
  );
};

export const setTableSchema = (
  name: string,
  tableName: string,
  schemaName: string
) => {
  if (!metadata[name]) metadata[name] = new EntityMetadata(name);
  metadata[name].setSchemaName(schemaName);
  metadata[name].setTableName(tableName);
};

export const deleteEntity = (name: string) => delete metadata[name];

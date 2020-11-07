import {
  fromSQLValue,
  PostgresType,
  StudsType,
  toSQLValue,
} from "../utility/encoding";
import { Primitive } from "../utility/types";

const metadata: Metadata = {};

interface ObjectType {
  [index: string]: any;
}

interface Metadata {
  [index: string]: EntityMetadata;
}

export type MapperValue = {
  name: string;
  type: StudsType;
  databaseType: PostgresType;
};

type Mapper = {
  [index: string]: MapperValue;
};

interface InverseMapper {
  [index: string]: MapperValue;
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
    databaseType: PostgresType
  ) {
    this.mapper[propertyColumn] = {
      type,
      name: databaseColumn,
      databaseType,
    };

    this.inverseMapper[databaseColumn] = {
      type,
      name: propertyColumn,
      databaseType,
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
}

export const getMetadata = <T>(name: string): EntityMetadata => metadata[name];

export const addColumn = (
  name: string,
  databaseColumn: string,
  propertyColumn: string,
  type: StudsType,
  databaseType: PostgresType
) => {
  if (!metadata[name]) metadata[name] = new EntityMetadata(name);
  metadata[name].addColumn(propertyColumn, databaseColumn, type, databaseType);
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

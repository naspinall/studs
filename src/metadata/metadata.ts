const metadata: Metadata = {};

interface ObjectType {
  [index: string]: any;
}

const emptyMetadata: EntityMetadata<any> = {
  tableName: "",
  schemaName: "",
  mapper: {},
  inverseMapper: {},
};

interface Metadata {
  [index: string]: EntityMetadata<any>;
}

export type MapperValue = {
  name: string;
  type: string;
};

type Mapper<T> = {
  [K in keyof T]: MapperValue;
};

interface InverseMapper<T> {
  [index: string]: {
    name: keyof T;
    type: string;
  };
}

export interface EntityMetadata<T> {
  tableName: string;
  schemaName: string;
  mapper: Mapper<T>;
  inverseMapper: InverseMapper<T>;
}

export const getMetadata = <T>(name: string): EntityMetadata<T> =>
  metadata[name];

export const addColumn = (
  name: string,
  databaseColumn: string,
  propertyColumn: string,
  type: string
) => {
  if (!metadata[name]) metadata[name] = { ...emptyMetadata };
  metadata[name].mapper[propertyColumn] = { type, name: databaseColumn };
  metadata[name].inverseMapper[databaseColumn] = { type, name: propertyColumn };
};

export const setTableSchema = (
  name: string,
  tableName: string,
  schemaName: string
) => {
  metadata[name] = {
    ...metadata[name],
    tableName,
    schemaName,
  };
};

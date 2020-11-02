import { setTableSchema } from "../metadata/metadata";

interface EntityConfiguration {
  schema: string;
  tableName: string;
}

export const Entity = (config: EntityConfiguration): ClassDecorator => {
  return (constructor: Function) => {
    setTableSchema(constructor.name, config.tableName, config.schema);
  };
};

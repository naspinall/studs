import { addColumn, setTableSchema } from "../metadata/metadata";

export interface ColumnOptions {
  name: string;
}

export const Column = (
  type: string,
  options: ColumnOptions
): PropertyDecorator => {
  return (target: Object, key: string | symbol) => {
    // Add Column to metadata
    addColumn(target.constructor.name, options.name, String(key), type);
  };
};

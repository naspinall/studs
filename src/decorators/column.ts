import { addColumn } from "../metadata/metadata";
import { toLowercase } from "../utility/array";
import { PostgresType, StudsType } from "../utility/encoding";

export interface ColumnOptions {
  name: string;
}

export const Column = (
  type: PostgresType,
  options: ColumnOptions
): PropertyDecorator => {
  return (target: Object, key: string | symbol) => {
    // Inferring the type
    // TODO Make inference better
    const studsType = toLowercase(Reflect.getMetadata("design:type", target, key).name) as StudsType;

    // Add Column to metadata
    addColumn(
      target.constructor.name,
      options.name,
      String(key),
      studsType,
      type
    );
  };
};

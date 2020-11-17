export type Primitive = boolean | string | number | Date | null | Object;

export type ClassType<T> = { new (): T };

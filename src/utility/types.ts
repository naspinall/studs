export type Primitive = boolean | string | number | Date;

export type ClassType<T> = { new (): T };

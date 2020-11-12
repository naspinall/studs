export type Primitive = boolean | string | number | Date | null;

export type ClassType<T> = { new (): T };

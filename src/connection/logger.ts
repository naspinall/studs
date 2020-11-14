import { Primitive } from "../utility/types";

export interface StudsLogger {
  logQuery(query: string, parameters?: Array<Primitive>): void;
  logSlowQuery(query: string, parameters?: Array<Primitive>): void;
  log(level: "info" | "warning" | "debug", message: any): void;
}

export class StudsDefaultLogger implements StudsLogger {
  logQuery(query: string, parameters: Array<Primitive>): void {
    console.log({
      query,
      parameters,
      type: "QUERY",
    });
  }
  logSlowQuery(query: string, parameters: Array<Primitive>): void {
    console.log({
      query,
      parameters,
      type: "SLOW QUERY",
    });
  }
  log(level: "info" | "warning" | "debug", message: any): void {
    console.log({
      level,
      message,
    });
  }
}

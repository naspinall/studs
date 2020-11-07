import { client } from "../connection/connection";
import { Primitive } from "../utility/types";

export class QueryRunner {
  async query(query: string, parameters: Array<Primitive>) {
    return client.query(query, parameters);
  }
}

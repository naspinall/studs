import "reflect-metadata";
import { createConnection } from "./connection/connection";
import { Any } from "./operators/Any";
import { LessThan } from "./operators/LessThan";
import { Ducks } from "../spec/Ducks";
(async () => {
  createConnection({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_POST),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  console.log(
    Ducks.createSelectQueryBuilder("farm")
      .select("id", "name")
      .where({
        //@ts-ignore
        id: LessThan(10),
        //@ts-ignore
        name: Any(10, 11, 12, 13, 14, 15),
        sid: "10",
      })
      .toSQL()
  );
})();

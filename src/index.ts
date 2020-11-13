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
    console.log(
      await Ducks.createInsertQueryBuilder("ducks")
        .values({ name: "John Johnson" })
        .returning("*")
        .execute()
    )
  );
})();

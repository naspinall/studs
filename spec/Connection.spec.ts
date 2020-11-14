import "reflect-metadata";
import { createConnection } from "../src/connection/connection";
import { Ducks } from "./Ducks";

describe("Connecting To With A Single Database Connection", () => {
  it("Should connect to database", async () => {
    createConnection({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_POST),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });
  });

  it("Should Perform A Basic Select Query", async () => {
    await Ducks.createQueryBuilder().select("ducks").execute();
  });
});

describe("Connecting To With A Replicated Database Connection", () => {
  it("Should connect to database", async () => {
    createConnection({
      type: "postgres",
      replication: {
        reader: {
          host: process.env.POSTGRES_HOST,
          port: Number(process.env.POSTGRES_POST),
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
        },
        writer: {
          host: process.env.POSTGRES_HOST,
          port: Number(process.env.POSTGRES_POST),
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
        },
      },
    });
  });

  it("Should Perform A Basic Select Query", async () => {
    await Ducks.createQueryBuilder().select("ducks").execute();
  });
});

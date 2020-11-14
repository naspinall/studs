import "reflect-metadata";
import { createConnection, getConnection } from "../src/connection/connection";
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

  afterAll(async () => {
    getConnection().disconnect();
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

  it("Should read from reader with select for any query", async () => {
    const connection = getConnection();
    jest.spyOn(connection, "read");
    await connection.query("select * from farm.ducks");
    expect(getConnection().read).toBeCalled();
  });

  it("Should read from reader with SELECT for any query", async () => {
    const connection = getConnection();
    jest.spyOn(connection, "read");
    await connection.query("SELECT * from farm.ducks");
    expect(getConnection().read).toBeCalled();
  });

  it("Should update to writer for any query", async () => {
    const connection = getConnection();
    jest.spyOn(connection, "write");
    await connection.query(`update farm.ducks set name = 'Diego' where id = 1`);
    expect(getConnection().write).toBeCalled();
  });

  it("Should insert to writer for any query", async () => {
    const connection = getConnection();
    jest.spyOn(connection, "write");
    await connection.query(
      `insert into "farm"."ducks" ("id", "name", "breed", "feather_type", "house_id") values (DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)`
    );
    expect(getConnection().write).toBeCalled();
  });

  it("Should delete to writer for any query", async () => {
    const connection = getConnection();
    jest.spyOn(connection, "write");
    await connection.query(`delete from farm.ducks where id = 1`);
    expect(getConnection().write).toBeCalled();
  });

  it("Should write in a transaction", async () => {
    await getConnection().writeTransaction(
      `update farm.ducks set name = 'Diego' where id = 1`
    );
  });

  afterAll(async () => {
    getConnection().disconnect();
  });
});

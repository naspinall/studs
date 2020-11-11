import "reflect-metadata";
import {
  setTableSchema,
  addColumn,
  getMetadata,
} from "../src/metadata/metadata";
import { WhereQueryBuilder } from "../src/builder/whereQueryBuilder";
import { Ducks } from "./Ducks";
import { Or } from "../src/operators/Or";
import { GreaterThan } from "../src/operators/GreaterThan";
import { Raw } from "../src/operators/Raw";
import { createConnection } from "../src/connection/connection";
import { House } from "./House";

describe("Where Builder", () => {
  beforeAll(() => {
    setTableSchema("ducks", "ducks", "farm");
    addColumn("ducks", "id", "id", "number", "int");
    addColumn("ducks", "name", "name", "string", "text");
    addColumn("ducks", "featherType", "feather_type", "string", "text");
  });

  it("Should Build A Where Query", () => {
    const metadata = getMetadata("ducks");

    const whereQueryBuilder = new WhereQueryBuilder<Ducks>().configure({
      alias: "ducks",
      metadata,
    });

    whereQueryBuilder.where({
      id: 1,
      name: "Mundugus Fletcher",
    });

    const [sql, parameters] = whereQueryBuilder.toSQL();
    expect(sql).toBe(" where ducks.id = $1 and ducks.name = $2");
    expect(parameters).toStrictEqual(["1", "'Mundugus Fletcher'"]);
  });

  it("Should Build A Where Query With An Or", () => {
    const metadata = getMetadata("ducks");

    const whereQueryBuilder = new WhereQueryBuilder<Ducks>().configure({
      alias: "ducks",
      metadata,
    });

    whereQueryBuilder.where({
      //@ts-ignore
      id: Or(
        Raw((alias) => `${alias} <> 1`),
        GreaterThan(1)
      ),
      name: "Mundugus Fletcher",
    });

    const [sql, parameters] = whereQueryBuilder.toSQL();
    expect(sql).toBe(
      " where (ducks.id <> 1 or ducks.id > $1) and ducks.name = $2"
    );
    expect(parameters).toStrictEqual(["1", "'Mundugus Fletcher'"]);
  });

  it("Should Build An Empty Where Query", () => {
    const metadata = getMetadata("ducks");

    const whereQueryBuilder = new WhereQueryBuilder<Ducks>().configure({
      alias: "ducks",
      metadata,
    });

    whereQueryBuilder.where({});

    const [sql, parameters] = whereQueryBuilder.toSQL();
    expect(sql).toBe("");
    expect(parameters).toStrictEqual([]);
  });

  it("Should Build A Where With A Named Parameter", () => {
    const metadata = getMetadata("ducks");

    const whereQueryBuilder = new WhereQueryBuilder<Ducks>().configure({
      alias: "ducks",
      metadata,
    });

    whereQueryBuilder.andWhere("ducks.id <> :value", { value: 1 });

    const [sql, parameters] = whereQueryBuilder.toSQL();
    expect(sql).toBe(" where ducks.id <> $1");
    expect(parameters).toStrictEqual([1]);
  });

  it("Should Build A Where With Multiple Named Parameters", () => {
    const metadata = getMetadata("ducks");

    const whereQueryBuilder = new WhereQueryBuilder<Ducks>().configure({
      alias: "ducks",
      metadata,
    });

    whereQueryBuilder.andWhere("ducks.id <> :value", { value: 1 });
    whereQueryBuilder.andWhere("ducks.id between :lower and :upper", {
      lower: 0,
      upper: 1,
    });

    const [sql, parameters] = whereQueryBuilder.toSQL();
    expect(sql).toBe(" where ducks.id <> $1 and ducks.id between $2 and $3");
    expect(parameters).toStrictEqual([1, 0, 1]);
  });
});

describe("Select Builder", () => {
  beforeAll(() => {
    setTableSchema("ducks", "ducks", "farm");
    addColumn("ducks", "id", "id", "number", "int");
    addColumn("ducks", "name", "name", "string", "text");

    setTableSchema("house", "house", "farm");
    addColumn("house", "id", "id", "number", "int");
  });

  it("Should create a select query", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks").toSQL();
    expect(query).toBe(`select * from "farm"."ducks" as "ducks"`);
    expect(parameters).toStrictEqual([]);
  });

  it("Should create a select query ordering", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .orderBy("id", "DESC")
      .toSQL();
    expect(query).toBe(
      `select * from "farm"."ducks" as "ducks" order by "id" DESC`
    );
    expect(parameters).toStrictEqual([]);
  });

  it("Should create a select query with a limit", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .limit(100)
      .toSQL();
    expect(query).toBe(`select * from "farm"."ducks" as "ducks" limit $1`);
    expect(parameters).toStrictEqual([100]);
  });

  it("Should create a select query with a group by", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .groupBy("ducks.id")
      .toSQL();
    expect(query).toBe(
      `select * from "farm"."ducks" as "ducks" group by "ducks"."id"`
    );
    expect(parameters).toStrictEqual([]);
  });

  it("Should create a select query with a group by", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .groupBy("ducks.id")
      .toSQL();
    expect(query).toBe(
      `select * from "farm"."ducks" as "ducks" group by "ducks"."id"`
    );
    expect(parameters).toStrictEqual([]);
  });

  it("Should create a select query with a group by and a having", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .groupBy("ducks.id")
      .having("ducks.id > :value", { value: 1 })
      .having("ducks.name = :value", { value: "Mundungus Fletcher" })
      .toSQL();
    expect(query).toBe(
      `select * from "farm"."ducks" as "ducks" group by "ducks"."id" having "ducks"."id" > $1 and "ducks"."name" = $2`
    );
    expect(parameters).toStrictEqual([1, "Mundungus Fletcher"]);
  });

  it("Should create a select query with multiple group bys", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .groupBy("ducks.id", "ducks.name")
      .toSQL();
    expect(query).toBe(
      `select * from "farm"."ducks" as "ducks" group by "ducks"."id", "ducks"."name"`
    );
    expect(parameters).toStrictEqual([]);
  });

  it("Should create a select query with an offset", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .offset(100)
      .toSQL();
    expect(query).toBe(`select * from "farm"."ducks" as "ducks" offset $1`);
    expect(parameters).toStrictEqual([100]);
  });

  it("Should create a select query with an offset and limit", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .offset(100)
      .limit(100)
      .toSQL();
    expect(query).toBe(
      `select * from "farm"."ducks" as "ducks" offset $1 limit $2`
    );
    expect(parameters).toStrictEqual([100, 100]);
  });

  it("Should create a select query with columns", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .select("id", "featherType")
      .toSQL();
    expect(query).toBe(
      `select "ducks"."id" as "id", "ducks"."feather_type" as "featherType" from "farm"."ducks" as "ducks"`
    );
    expect(parameters).toStrictEqual([]);
  });

  it("Should create a select query with where", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .where({
        id: 1,
        name: "Mundugus Fletcher",
      })
      .toSQL();
    expect(query).toBe(
      `select * from "farm"."ducks" as "ducks" where "ducks"."id" = $1 and "ducks"."name" = $2`
    );
    expect(parameters).toStrictEqual(["1", "'Mundugus Fletcher'"]);
  });
});

describe("Relation Builder", () => {
  it("Should Build A Left Join ", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .leftJoin("farm.house", "house", "ducks.houseId = house.id")
      .toSQL();

    expect(query).toBe(
      `select * from "farm"."ducks" as "ducks" left join "farm"."house" "house" on ( "ducks"."house_id" = "house"."id" )`
    );
  });

  it("Should Build A Left Join And Select From Join", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .addSelect("ducks.id", "id")
      .leftJoin("farm.house", "house", "ducks.houseId = house.id")
      .toSQL();

    expect(query).toBe(
      `select "ducks"."id" as "id" from "farm"."ducks" as "ducks" left join "farm"."house" "house" on ( "ducks"."house_id" = "house"."id" )`
    );
  });

  it("Should Build An Inner Join", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .innerJoin("farm.house", "house", "ducks.houseId = house.id")
      .toSQL();

    expect(query).toBe(
      `select * from "farm"."ducks" as "ducks" inner join "farm"."house" "house" on ( "ducks"."house_id" = "house"."id" )`
    );
  });

  it("Should Build A Left Join With Two Entities", () => {
    const [query, parameters] = Ducks.createSelectQueryBuilder("ducks")
      .leftJoin(House, "house", "ducks.houseId = house.id")
      .toSQL();

    expect(query).toBe(
      `select * from "farm"."ducks" as "ducks" left join "farm"."house" "house" on ( "ducks"."house_id" = "house"."id" )`
    );
  });
});

describe("Select Builder Querying Test Database", () => {
  beforeAll(async () => {
    createConnection({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_POST),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });
    setTableSchema("ducks", "ducks", "farm");
    addColumn("ducks", "id", "id", "number", "int");
    addColumn("ducks", "name", "name", "string", "text");
    addColumn("ducks", "breed", "breed", "string", "text");
    addColumn("ducks", "featherType", "feather_type", "string", "text");
  });

  it("Should create a select query", async () => {
    const ducks = await Ducks.createSelectQueryBuilder("ducks")
      .select("id")
      .execute();
  });

  it("Should create a select query ordering", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .orderBy("id", "DESC")
      .execute();
  });

  it("Should create a select query with a limit", async () => {
    await Ducks.createSelectQueryBuilder("ducks").limit(100).execute();
  });

  it("Should create a select query with a group by", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .select("id")
      .groupBy("ducks.id")
      .execute();
  });

  it("Should create a select query with a group by", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .select("id")
      .groupBy("ducks.id")
      .execute();
  });

  it("Should create a select query with a group by and a having", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .select("id", "name")
      .groupBy("ducks.id", "ducks.name")
      .having("ducks.id > :value", { value: 1 })
      .having("ducks.name = :value", { value: "Mundungus Fletcher" })
      .execute();
  });

  it("Should create a select query with multiple group bys", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .select("id", "name")
      .groupBy("ducks.id", "ducks.name")
      .execute();
  });

  it("Should create a select query with an offset", async () => {
    await Ducks.createSelectQueryBuilder("ducks").offset(100).execute();
  });

  it("Should create a select query with an offset and limit", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .offset(100)
      .limit(100)
      .execute();
  });

  it("Should create a select query with columns", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .select("id", "featherType")
      .execute();
  });

  it("Should create a select query with where", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .where({
        id: 1,
        name: "Mundugus Fletcher",
      })
      .execute();
  });

  it("Should Build A Left Join ", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .leftJoin("farm.house", "house", "ducks.house_id = house.id")
      .execute();
  });

  it("Should Build A Left Join ", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .leftJoin("farm.house", "house", "ducks.house_id = house.id")
      .addSelect("house.id", "houseId")
      .execute();
  });

  it("Should Build A Left Join With An Entity", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .addSelect("house.id", "house")
      .leftJoin(House, "house", "ducks.house_id = house.id")
      .execute();
  });

  it("Should Build An Inner Join", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .addSelect("house.id", "house")
      .innerJoin("farm.house", "house", "ducks.house_id = house.id")
      .execute();
  });

  it("Should Build An Inner Join", async () => {
    await Ducks.createSelectQueryBuilder("ducks")
      .addSelect("house.id", "house")
      .innerJoin(House, "house", "ducks.house_id = house.id")
      .execute();
  });

});

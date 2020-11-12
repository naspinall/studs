import {
  addColumn,
  deleteEntity,
  setTableSchema,
} from "../src/metadata/metadata";
import {
  toArray,
  toLowercase,
  toParameterList,
} from "../src/utility/array";
import {
  escapeAllIdentifiers,
  fromSQLValue,
  toSQLValue,
} from "../src/utility/encoding";

describe("To Lowercase", () => {
  it("Should put to lowercase", () => {
    const name = "Matt Christman";

    expect(toLowercase(name)).toBe("matt Christman");
  });
});

describe("To Parameter List", () => {
  it("Should Create A Parameter List From 0", () => {
    const list = toParameterList(0, 5);
    expect(list).toBe("$1, $2, $3, $4, $5");
  });

  it("Should Create A Parameter List From 10", () => {
    const list = toParameterList(10, 5);
    expect(list).toBe("$11, $12, $13, $14, $15");
  });
});

describe("To Array", () => {
  it("Should Create An Array With A Default Formatter", () => {
    const array = toArray(["1", "2", "3", "4", "5"]);
    expect(array).toBe("1, 2, 3, 4, 5");
  });

  it("Should Create An Array With A Different Formatter", () => {
    const array = toArray(
      ["1", "2", "3", "4", "5"],
      (input: string) => `$${input}`
    );
    expect(array).toBe("$1, $2, $3, $4, $5");
  });
});

describe("To SQL Value", () => {
  it("Should Parse A Boolean", () => {
    const value = toSQLValue(true, "boolean");
    expect(value).toBe("true");
  });

  it("Should Parse A Big Int", () => {
    const value = toSQLValue(1, "bigint");
    expect(value).toBe("1");
  });

  it("Should Parse A Integer", () => {
    const value = toSQLValue(1, "integer");
    expect(value).toBe("1");
  });

  it("Should Parse A Int", () => {
    const value = toSQLValue(1, "int");
    expect(value).toBe("1");
  });

  it("Should Parse A TimeStamptz", () => {
    const value = toSQLValue(new Date(0), "timestamptz");
    expect(value).toBe("1970-01-01T00:00:00.000Z");
  });

  it("Should Parse A Varchar", () => {
    const value = toSQLValue("Matt Christman", "varchar");
    expect(value).toBe("'Matt Christman'");
  });

  it("Should Parse A Text", () => {
    const value = toSQLValue("Matt Christman", "text");
    expect(value).toBe("'Matt Christman'");
  });

  it("Should Reject A Bad Type", () => {
    //@ts-expect-error Testing bad type
    expect(() => toSQLValue("Matt Christman", "a bad type")).toThrow();
  });
});

describe("From SQL Value", () => {
  it("Should Parse A Boolean", () => {
    const value = fromSQLValue("true", "boolean");
    expect(value).toBe(true);
  });

  it("Should Parse A String", () => {
    const value = fromSQLValue("Matt Christman", "string");
    expect(value).toBe("Matt Christman");
  });

  it("Should Parse A Number", () => {
    const value = fromSQLValue("1", "number");
    expect(value).toBe(1);
  });

  it("Should Parse A Date", () => {
    const value = fromSQLValue("1970-01-01T00:00:00.000Z", "date");
    expect(value).toStrictEqual(new Date(0));
  });
});

describe("Escape All Identifiers", () => {
  it("Should Escape An Identifier", () => {
    const sqlString = escapeAllIdentifiers(
      "select * from farm as farm",
      "farm"
    );
    expect(sqlString).toBe('select * from "farm" as "farm"');
  });

  it("Should Escape Multiple", () => {
    const sqlString = escapeAllIdentifiers(
      "select farm.id from farm as farm",
      "farm",
      "id"
    );
    expect(sqlString).toBe('select "farm"."id" from "farm" as "farm"');
  });

  it("Should Escape With A Similar Name As An Identifier", () => {
    const sqlString = escapeAllIdentifiers(
      `select farm.id from farm as farm where id = 'sid'`,
      "farm",
      "id"
    );
    expect(sqlString).toBe(
      `select "farm"."id" from "farm" as "farm" where "id" = 'sid'`
    );
  });

  it("Should Escape With A Similar Name As An Identifier With An Underscore", () => {
    const sqlString = escapeAllIdentifiers(
      `select * from farm.ducks as ducks left join farm.house house on ( ducks.house_id = house.id )`,
      "farm",
      "id",
      "ducks",
      "house",
      "house_id"

    );
    expect(sqlString).toBe(
      `select * from "farm"."ducks" as "ducks" left join "farm"."house" "house" on ( "ducks"."house_id" = "house"."id" )`
    );
  });
});

describe("", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

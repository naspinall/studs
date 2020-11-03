import {
  setTableSchema,
  deleteEntity,
  addColumn,
  getMetadata,
} from "../src/metadata/metadata";
import { Any } from "../src/operators/Any";
import { Equal } from "../src/operators/Equal";
import { Between } from "../src/operators/Between";
import { GreaterThan } from "../src/operators/GreaterThan";
import { GreaterThanOrEqual } from "../src/operators/GreaterThanOrEqual";
import { LessThan } from "../src/operators/LessThan";
import { LessThanOrEqual } from "../src/operators/LessThanOrEqual";
import { IsNull } from "../src/operators/IsNull";
import { IsNotNull } from "../src/operators/IsNotNull";
import { In } from "../src/operators/In";
import { Or } from "../src/operators/Or";
import { Raw } from "../src/operators/Raw";

describe("Any", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create ANY Statement With Parameters", () => {
    const operator = Any(1, 2, 3, 4);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id ANY ({ $1, $2, $3, $4 })");
  });

  it("Should Create ANY Statement With One Parameter", () => {
    const operator = Any(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id ANY ({ $1 })");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = Any(1, 2, 3, 4);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id ANY ({ $11, $12, $13, $14 })");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("In", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create ANY Statement With Parameters", () => {
    const operator = In(1, 2, 3, 4);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id IN ($1, $2, $3, $4)");
  });

  it("Should Create ANY Statement With One Parameter", () => {
    const operator = In(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id IN ($1)");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = In(1, 2, 3, 4);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id IN ($11, $12, $13, $14)");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("Between", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create Between Statement With Parameters", () => {
    const operator = Between(1, 2);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id BETWEEN $1 AND $2");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = Between(1, 2);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id BETWEEN $11 AND $12");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("Equal", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create Between Statement With Parameters", () => {
    const operator = Equal(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id = $1");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = Equal(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id = $11");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("Greater Than", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create Between Statement With Parameters", () => {
    const operator = GreaterThan(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id > $1");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = GreaterThan(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id > $11");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("Greater Than Or Equal", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create Between Statement With Parameters", () => {
    const operator = GreaterThanOrEqual(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id >= $1");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = GreaterThanOrEqual(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id >= $11");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("Less Than", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create Between Statement With Parameters", () => {
    const operator = LessThan(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id < $1");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = LessThan(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id < $11");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("Less Than Or Equal", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create Between Statement With Parameters", () => {
    const operator = LessThanOrEqual(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id <= $1");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = LessThanOrEqual(1);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id <= $11");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("Is Null", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create Between Statement With Parameters", () => {
    const operator = IsNull();
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id IS NULL");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = IsNull();
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id IS NULL");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("Is Not Null", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create Between Statement With Parameters", () => {
    const operator = IsNotNull();
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id IS NOT NULL");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = IsNotNull();
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id IS NOT NULL");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("Or", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Or With A Is Null", () => {
    const operator = Or(Equal(1), IsNull());
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("(test.id = $1 OR test.id IS NULL)");
  });

  it("Should Or With A Is Null With A Different Count", () => {
    const operator = Or(Equal(1), IsNull());
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("(test.id = $11 OR test.id IS NULL)");
  });

  it("Should Or With Two Parameters", () => {
    const operator = Or(Equal(1), LessThan(0));
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("(test.id = $1 OR test.id < $2)");
  });

  it("Should Or With Two Parameters", () => {
    const operator = Or(Equal(1), LessThan(0));
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("(test.id = $11 OR test.id < $12)");
  });

  it("Should Or With Two List Parameters", () => {
    const operator = Or(In(1, 2, 3, 4, 5), Any(1, 2));
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe(
      "(test.id IN ($11, $12, $13, $14, $15) OR test.id ANY ({ $16, $17 }))"
    );
  });

  it("Should Or With Two List Parameters With Different Count", () => {
    const operator = Or(Equal(1), LessThan(0));
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("(test.id = $11 OR test.id < $12)");
  });
});

describe("Raw Operator", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Create Between Statement With Parameters", () => {
    const operator = Raw((alias) => `${alias} <> 1`);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id <> 1");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = Raw((alias) => `${alias} <> 1`);
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id <> 1");
  });

  it("Should Create ANY Statement With With A Different Count", () => {
    const operator = Or(
      Raw((alias) => `${alias} <> 1`),
      Raw((alias) => `${alias} > 100`)
    );
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10,
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("(test.id <> 1 OR test.id > 100)");
  });

  it("Should Create Operator With Named Parameter", () => {
    const operator = Raw((alias) => `${alias} = :value`, { value: 500 });
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id = $1");
  });

  it("Should Create Operator With Named Parameter List", () => {
    const operator = Raw((alias) => `${alias} IN (:...value)`, { value: [500,600] });
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",

    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id IN ($1, $2)");
  });

  it("Should Create Operator With Named Parameter Array", () => {
    const operator = Raw((alias) => `${alias} ANY (:value)`, { value: [500,600] });
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id ANY ({ $1, $2 })");
  });

  it("Should Create Operator With Named Parameter", () => {
    const operator = Raw((alias) => `${alias} = :value`, { value: 500 });
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count : 10
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id = $11");
  });

  it("Should Create Operator With Named Parameter List", () => {
    const operator = Raw((alias) => `${alias} IN (:...value)`, { value: [500,600] });
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count : 10

    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id IN ($11, $12)");
  });

  it("Should Create Operator With Named Parameter Array", () => {
    const operator = Raw((alias) => `${alias} ANY (:value)`, { value: [500,600] });
    operator.configure({
      metadata: getMetadata("testEntity"),
      alias: "test",
      column: "id",
      count: 10
    });

    const [SQL] = operator.toSQL();
    expect(SQL).toBe("test.id ANY ({ $11, $12 })");
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

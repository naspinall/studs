import {
  setTableSchema,
  addColumn,
  deleteEntity,
  getMetadata,
} from "../src/metadata/metadata";

describe("Getting Metadata", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
  });

  it("Should Get Metadata", () => {
    const metadata = getMetadata("testEntity");
    expect(metadata.name).toBe("testEntity");
  });

  it("Should Delete An Entity", () => {
    deleteEntity("testEntity");
    const metadata = getMetadata("testEntity");
    expect(metadata).toBe(undefined);
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

describe("Adding Metadata", () => {
  it("Should Create Metadata When Adding A Column", () => {
    addColumn("testEntity", "id", "id", "number", "int");
    const metadata = getMetadata("testEntity");
    expect(metadata.name).toBe("testEntity");
  });

  it("Should Set Schema And Table Name", () => {
    setTableSchema("testEntity", "testTable", "testSchema");
    const metadata = getMetadata("testEntity");
    expect(metadata.tableName).toBe("testTable");
    expect(metadata.schemaName).toBe("testSchema");
  });
});

describe("Mapping", () => {
  beforeAll(() => {
    setTableSchema("testEntity", "testTable", "testSchema");
    addColumn("testEntity", "id", "id", "number", "int");
    addColumn("testEntity", "a_long_id", "aLongId", "number", "int");
    addColumn("testEntity", "a_string", "aString", "string", "text");
    addColumn(
      "testEntity",
      "date_created",
      "dateCreated",
      "date",
      "timestamptz"
    );
  });

  it("Should Map Integer Property Column", () => {
    const metadata = getMetadata("testEntity");
    const { name, value } = metadata.map("aLongId", "1");
    expect(name).toBe("a_long_id");
    expect(value).toBe("1");
  });

  it("Should Map String Property Column", () => {
    const metadata = getMetadata("testEntity");
    const { name, value } = metadata.map("aString", "A String");
    expect(name).toBe("a_string");
    expect(value).toBe("'A String'");
  });

  it("Should Map Date Property Column", () => {
    const date = new Date();
    const metadata = getMetadata("testEntity");
    const { name, value } = metadata.map("dateCreated", date);
    expect(name).toBe("date_created");
    expect(value).toBe(`${date.toISOString()}`);
  });

  it("Should Inverse Map Integer Property Column", () => {
    const metadata = getMetadata("testEntity");
    const { name, value } = metadata.inverseMap("a_long_id", "1");
    expect(name).toBe("aLongId");
    expect(value).toBe(1);
  });

  it("Should Inverse Map String Property Column", () => {
    const metadata = getMetadata("testEntity");
    const { name, value } = metadata.inverseMap("a_string", "A String");
    expect(name).toBe("aString");
    expect(value).toBe("A String");
  });

  it("Should Inverse Map Date Property Column", () => {
    const date = new Date();
    const metadata = getMetadata("testEntity");
    const { name, value } = metadata.inverseMap(
      "date_created",
      date.toISOString()
    );
    expect(name).toBe("dateCreated");
    expect(value).toStrictEqual(date);
  });

  it("Should Inverse Map Column", () => {
    const metadata = getMetadata("testEntity");
    const name = metadata.mapColumn("aString");
    expect(name).toBe("a_string");
  });

  it("Should Inverse Map Column", () => {
    const metadata = getMetadata("testEntity");
    const name = metadata.inverseMapColumn("a_string");
    expect(name).toBe("aString");
  });

  it("Should Get Property Columns", () => {
    const metadata = getMetadata("testEntity");
    const columns = metadata.listPropertyColumns();
    expect(columns).toStrictEqual(["id", "aLongId", "aString", "dateCreated"]);
  });

  it("Should Get Database Columns", () => {
    const metadata = getMetadata("testEntity");
    const columns = metadata.listDatabaseColumns();
    expect(columns).toStrictEqual(["id", "a_long_id", "a_string", "date_created"]);
  });

  it("Should get Studs Type", () => {
    const metadata = getMetadata("testEntity");
    const type = metadata.getStudsType("dateCreated");
    expect(type).toBe("date")
  })

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

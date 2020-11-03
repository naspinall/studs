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
    addColumn("testEntity", "aLongID", "a_long_id", "number", "int");
  });

  it("Should Map Property Column", () => {
    const databaseColumn = getMetadata("testEntity").mapColumn("a_long_id");
    expect(databaseColumn).toBe("a_long_id");
  });

  it("Should Map Database Column", () => {
    deleteEntity("testEntity");
    const metadata = getMetadata("testEntity");
    expect(metadata).toBe(undefined);
  });

  afterAll(() => {
    deleteEntity("testEntity");
  });
});

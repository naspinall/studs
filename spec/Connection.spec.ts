import "reflect-metadata"
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../src/connection/connection";
import { Ducks } from "./Ducks";

describe("Connecting To Database", () => {
  it("Should connect to database", async () => {
    await connectToDatabase();
  });

  it("Should Perform A Basic Select Query", async () => {
    await Ducks.createSelectQueryBuilder("ducks").execute();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });
});

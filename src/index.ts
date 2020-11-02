import "reflect-metadata";
import { Ducks } from "./entities/ducks";
import { connectToDatabase } from "./connection/connection";

(async () => {
  await connectToDatabase();

  console.log(
    Ducks.createSelectQueryBuilder("sim")
      .select("id", "name")
      .where({
        //@ts-ignore
        id: 1,
      })
      .andWhere("ducks.id = :id and ducks.id = :anotherID", {
        id: "id",
        anotherID: "anotherID",
      })
      .toSQL()
  );
})();

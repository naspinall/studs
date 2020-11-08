import "reflect-metadata";
import { connectToDatabase } from "./connection/connection";
import { Any } from "./operators/Any";
import { LessThan } from "./operators/LessThan";
(async () => {
  await connectToDatabase();

  console.log(
    Ducks.createSelectQueryBuilder("farm")
      .select("id", "name")
      .where({
        //@ts-ignore
        id: LessThan(10),
        //@ts-ignore
        name: Any(10, 11, 12, 13, 14, 15),
        sid : "10"
      })
      .toSQL()
  );
})();

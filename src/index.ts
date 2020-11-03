import "reflect-metadata";
import { Ducks } from "./entities/ducks";
import { connectToDatabase } from "./connection/connection";
import { Or } from "./operators/Or";
import { Raw } from "./operators/Raw";
import { Equal } from "./operators/Equal";
import { Any } from "./operators/Any";
import { GreaterThan } from "./operators/GreaterThan";
import { GreaterThanOrEqual } from "./operators/GreaterThanOrEqual";
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

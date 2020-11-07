import { Column } from "../src/decorators/column";
import { Entity } from "../src/decorators/entity";
import { BaseEntity } from "../src/entity";

@Entity({
  tableName: "ducks",
  schema: "farm",
})
export class Ducks extends BaseEntity {
  @Column("int", {
    name: "id",
  })
  id!: number;

  @Column("text", {
    name: "name",
  })
  name!: string;

  @Column("text", {
    name: "feather_type",
  })
  featherType!: string;
}

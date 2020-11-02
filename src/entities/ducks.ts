import { Column } from "../decorators/column";
import { Entity } from "../decorators/entity";
import { BaseEntity } from "../entity";

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
}

import { Column } from "../src/decorators/column";
import { Entity } from "../src/decorators/entity";
import { BaseEntity } from "../src/entity";

@Entity({
  tableName: "house",
  schema: "farm",
})
export class House extends BaseEntity {
  @Column("int", {
    name: "id",
  })
  id!: number;
}

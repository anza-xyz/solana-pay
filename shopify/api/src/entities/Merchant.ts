import { Column, Entity, Index, MongoRepository, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export class Merchant {
  @ObjectIdColumn()
  _id: ObjectID;

  @Index({ unique: true })
  @Column()
  shop: string;

  @Column()
  access_token: string;

  @Column()
  wallet?: string;

  @Column()
  scope: string;
}

export class MerchantRepository extends MongoRepository<Merchant> {}

import { Column, Entity, MongoRepository, ObjectID, ObjectIdColumn, Repository } from "typeorm";

@Entity()
export class OnboardRequest {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  shop: string;

  @Column()
  state: string;
}

export class OnboardRequestRepository extends MongoRepository<OnboardRequest> {}

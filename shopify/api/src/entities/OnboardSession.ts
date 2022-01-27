import { Column, Entity, EntityRepository, Generated, MongoRepository, ObjectID, ObjectIdColumn } from "typeorm";
import { Singleton } from "typescript-ioc";

@Entity()
export class OnboardSession {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  @Generated("uuid")
  onboardSessionId: string;

  @Column()
  shop: string;
}

@Singleton
@EntityRepository(OnboardSession)
export class OnboardSessionRepository extends MongoRepository<OnboardSession> {}

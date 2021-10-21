import {
  Column,
  Entity,
  ObjectID,
  ObjectIdColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class PaymentSession {
  @ObjectIdColumn()
  id: ObjectID;

  @PrimaryColumn()
  sessionId: string;

  @Column()
  integration: string;

  @Column()
  meta: any;
}

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class PaymentSession {
  @PrimaryColumn()
  sessionId: string;

  @Column()
  integration: string;

  @Column()
  meta: any;
}

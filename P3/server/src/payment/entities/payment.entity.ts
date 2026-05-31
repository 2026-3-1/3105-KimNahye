import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  paymentKey: string;

  @Column({ unique: true })
  orderId: string;

  @Column()
  userId: string;

  @Column()
  courseId: string;

  @Column('int')
  amount: number;

  @CreateDateColumn()
  paidAt: Date;
}

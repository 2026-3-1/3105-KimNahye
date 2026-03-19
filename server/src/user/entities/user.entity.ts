import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { hash, compare } from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum';
import { RefreshToken } from '@auth/entities/refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
    eager: false,
  })
  refreshTokens: RefreshToken[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await hash(this.password, 10);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return compare(plainPassword, this.password);
  }
}

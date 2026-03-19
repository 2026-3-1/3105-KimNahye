import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 해싱된 리프레시 토큰 값
  @Column({ type: 'text' })
  token: string;

  // 만료 시각
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  // 무효화 여부 (로그아웃 / 재발급 시 true)
  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked: boolean;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 만료 여부 확인
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  // 유효한 토큰인지 확인
  isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}

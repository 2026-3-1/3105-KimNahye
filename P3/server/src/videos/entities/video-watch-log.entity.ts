import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Video } from './video.entity';

@Entity('video_watch_logs')
@Unique(['user', 'video'])
export class VideoWatchLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Video, { nullable: false, onDelete: 'CASCADE' })
  video: Video;

  @Column({ name: 'watched_duration', type: 'int', default: 0 })
  watchedDuration: number;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @UpdateDateColumn({ name: 'last_watched_at' })
  lastWatchedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

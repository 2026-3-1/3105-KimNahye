import { User } from '../entities/user.entity';

export interface IUsersRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  create(userData: Partial<User>): Promise<User>;
}

export const USERS_REPOSITORY = Symbol('IUsersRepository');

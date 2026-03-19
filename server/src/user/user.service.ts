import { Inject, Injectable } from '@nestjs/common';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from './interfaces/user-repository.interface';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findByEmailWithPassword(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async create(userData: Partial<User>): Promise<User> {
    return this.usersRepository.create(userData);
  }
}

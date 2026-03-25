import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from './interfaces/user-repository.interface';
import { User } from './entities/user.entity';
import { UserDetailResponse } from './dto/user-detail-response.dto';
import { UpdateUserRequestDto } from './dto/update-user-request.dto';
import { UpdateUserResponseDto } from './dto/update-user-response.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findByEmailWithPassword(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async create(userData: Partial<User>): Promise<User> {
    return this.userRepository.create(userData);
  }

  async getMe(userId: string): Promise<UserDetailResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async updateMe(
    userId: string,
    dto: UpdateUserRequestDto,
  ): Promise<UpdateUserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 이메일 중복 체크
    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepository.findByEmail(dto.email);

      if (exists) {
        throw new ConflictException('이미 사용 중인 이메일입니다.');
      }

      user.email = dto.email;
    }

    // 닉네임 수정
    if (dto.nickname) {
      user.nickname = dto.nickname;
    }

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    };
  }
}

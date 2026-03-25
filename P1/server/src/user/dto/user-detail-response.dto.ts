import { UserRole } from '@common/enums/user-role.enum';

export class UserDetailResponse {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  createdAt: Date;
}

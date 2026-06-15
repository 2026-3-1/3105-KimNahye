import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';

@ApiTags('관리자 (Admin)')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: '전체 유저 목록 조회' })
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: '유저 역할 변경' })
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Get('courses')
  @ApiOperation({ summary: '전체 강좌 목록 조회' })
  findAllCourses() {
    return this.adminService.findAllCourses();
  }

  @Delete('courses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '강좌 강제 삭제' })
  deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourse(id);
  }

  @Get('payments')
  @ApiOperation({ summary: '전체 결제 내역 조회' })
  findAllPayments() {
    return this.adminService.findAllPayments();
  }
}

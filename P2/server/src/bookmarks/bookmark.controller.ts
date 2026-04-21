import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { BookmarkResponse } from './dto/bookmark-response.dto';

@ApiTags('bookmarks')
@Controller()
@UseGuards(JwtAccessGuard)
@ApiBearerAuth('access-token')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get('videos/:videoId/bookmarks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '영상의 내 북마크 목록' })
  async getBookmarks(
    @Param('videoId') videoId: string,
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<BookmarkResponse[]>> {
    const data = await this.bookmarkService.getBookmarks(userId, videoId);
    return ApiResponseDto.success(data, '북마크 목록 조회에 성공하였습니다.', HttpStatus.OK);
  }

  @Post('videos/:videoId/bookmarks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '북마크 추가' })
  async createBookmark(
    @Param('videoId') videoId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateBookmarkDto,
  ): Promise<ApiResponseDto<BookmarkResponse>> {
    const data = await this.bookmarkService.createBookmark(userId, videoId, dto);
    return ApiResponseDto.success(data, '북마크가 추가되었습니다.', HttpStatus.CREATED);
  }

  @Patch('bookmarks/:bookmarkId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '북마크 메모 수정' })
  async updateBookmark(
    @Param('bookmarkId') bookmarkId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateBookmarkDto,
  ): Promise<ApiResponseDto<BookmarkResponse>> {
    const data = await this.bookmarkService.updateBookmark(userId, bookmarkId, dto);
    return ApiResponseDto.success(data, '북마크가 수정되었습니다.', HttpStatus.OK);
  }

  @Delete('bookmarks/:bookmarkId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '북마크 삭제' })
  async deleteBookmark(
    @Param('bookmarkId') bookmarkId: string,
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<null>> {
    await this.bookmarkService.deleteBookmark(userId, bookmarkId);
    return ApiResponseDto.success(null, '북마크가 삭제되었습니다.', HttpStatus.OK);
  }
}

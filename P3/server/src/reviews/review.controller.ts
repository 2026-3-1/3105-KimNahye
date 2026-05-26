import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponse } from './dto/review-response.dto';

@ApiTags('reviews')
@Controller('courses/:courseId/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '코스 리뷰 목록 조회 (공개)' })
  async getReviews(
    @Param('courseId') courseId: string,
  ): Promise<ApiResponseDto<ReviewResponse[]>> {
    const data = await this.reviewService.getReviews(courseId);
    return ApiResponseDto.success(data, '리뷰 목록 조회에 성공하였습니다.', HttpStatus.OK);
  }

  @Post()
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '리뷰 작성 (80% 수강 검증)' })
  async createReview(
    @Param('courseId') courseId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ApiResponseDto<ReviewResponse>> {
    const data = await this.reviewService.createReview(userId, courseId, dto);
    return ApiResponseDto.success(data, '리뷰가 작성되었습니다.', HttpStatus.CREATED);
  }

  @Put(':reviewId')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 리뷰 수정' })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ApiResponseDto<ReviewResponse>> {
    const data = await this.reviewService.updateReview(userId, reviewId, dto);
    return ApiResponseDto.success(data, '리뷰가 수정되었습니다.', HttpStatus.OK);
  }

  @Delete(':reviewId')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 리뷰 삭제' })
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<null>> {
    await this.reviewService.deleteReview(userId, reviewId);
    return ApiResponseDto.success(null, '리뷰가 삭제되었습니다.', HttpStatus.OK);
  }
}

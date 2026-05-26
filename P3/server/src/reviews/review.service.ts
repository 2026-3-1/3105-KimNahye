import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REVIEW_REPOSITORY, IReviewRepository } from './interfaces/review-repository.interface';
import { UserService } from 'src/user/user.service';
import { CourseService } from 'src/courses/course.service';
import { WATCH_LOG_REPOSITORY, IWatchLogRepository } from 'src/videos/interfaces/watch-log-repository.interface';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponse } from './dto/review-response.dto';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(WATCH_LOG_REPOSITORY)
    private readonly watchLogRepository: IWatchLogRepository,
    private readonly userService: UserService,
    private readonly courseService: CourseService,
  ) {}

  async getReviews(courseId: string): Promise<ReviewResponse[]> {
    const reviews = await this.reviewRepository.findByCourse(courseId);
    return reviews.map((r) => ({
      id: r.id,
      userId: r.user.id,
      userNickname: r.user.nickname,
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt,
    }));
  }

  async createReview(userId: string, courseId: string, dto: CreateReviewDto): Promise<ReviewResponse> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('존재하지 않는 사용자입니다.');

    const course = await this.courseService.findById(courseId);
    if (!course) throw new NotFoundException('존재하지 않는 강좌입니다.');

    const existing = await this.reviewRepository.findByUserAndCourse(user, course);
    if (existing) throw new ConflictException('이미 리뷰를 작성하셨습니다.');

    // 최소 1개 영상 수강 완료 검증
    const videoIds = (course.videos ?? []).map((v) => v.id);
    if (videoIds.length > 0) {
      const completedCount = await this.watchLogRepository.countCompleted(userId, videoIds);
      if (completedCount < 1) {
        throw new ForbiddenException('영상 1개 이상을 수강 완료한 후 리뷰를 작성할 수 있습니다.');
      }
    }

    const review = await this.reviewRepository.create(user, course, dto.rating, dto.content);
    return {
      id: review.id,
      userId: review.user.id,
      userNickname: review.user.nickname,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
    };
  }

  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto): Promise<ReviewResponse> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    if (review.user.id !== userId) throw new ForbiddenException('본인의 리뷰만 수정할 수 있습니다.');

    const updated = await this.reviewRepository.update(reviewId, dto.rating, dto.content);
    return {
      id: updated.id,
      userId: updated.user.id,
      userNickname: updated.user.nickname,
      rating: updated.rating,
      content: updated.content,
      createdAt: updated.createdAt,
    };
  }

  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    if (review.user.id !== userId) throw new ForbiddenException('본인의 리뷰만 삭제할 수 있습니다.');

    await this.reviewRepository.delete(reviewId);
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { EnrollmentService } from 'src/enrollments/enrollment.service';
import { UserService } from 'src/user/user.service';
import { CourseService } from 'src/courses/course.service';
import { MailService } from 'src/mail/mail.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { Payment } from './entities/payment.entity';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { withRetry } from 'src/common/utils/retry.util';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly enrollmentService: EnrollmentService,
    private readonly userService: UserService,
    private readonly courseService: CourseService,
    private readonly mailService: MailService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async confirm(userId: string, dto: ConfirmPaymentDto) {
    // 중복 결제 방지 (replay attack)
    const existing = await this.paymentRepository.findOne({
      where: { paymentKey: dto.paymentKey },
    });
    if (existing) {
      throw new ConflictException('이미 처리된 결제입니다.');
    }

    // 서버 측 가격 검증 (amount tampering 방지)
    const course = await this.courseService.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException('존재하지 않는 강좌입니다.');
    }
    if (dto.amount !== course.price) {
      throw new BadRequestException('결제 금액이 강좌 가격과 일치하지 않습니다.');
    }

    // 토스 결제 승인 (클라이언트 amount 아닌 서버 검증 금액 사용)
    const secretKey = this.configService.get<string>('TOSS_SECRET_KEY');
    const encoded = Buffer.from(`${secretKey}:`).toString('base64');

    let paymentData: any;
    try {
      const { data } = await withRetry(() =>
        axios.post(
          'https://api.tosspayments.com/v1/payments/confirm',
          { paymentKey: dto.paymentKey, orderId: dto.orderId, amount: course.price },
          {
            headers: {
              Authorization: `Basic ${encoded}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      paymentData = data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? '결제 승인에 실패했습니다.';
      throw new BadRequestException(message);
    }

    // 결제 기록 저장
    await this.paymentRepository.save(
      this.paymentRepository.create({
        paymentKey: dto.paymentKey,
        orderId: dto.orderId,
        userId,
        courseId: dto.courseId,
        amount: course.price,
      }),
    );

    const enrollment = await this.enrollmentService.enroll(userId, dto.courseId);

    // 이메일 발송 (실패해도 결제/수강에 영향 없음)
    const user = await this.userService.findById(userId);
    if (user) {
      const courseName = paymentData?.orderName ?? course.price + '원 강의';
      this.mailService
        .sendEnrollmentConfirmation(user.email, user.nickname, courseName, course.price)
        .catch(() => {});
    }

    return enrollment;
  }

  async handleWebhook(signature: string | undefined, body: WebhookEventDto): Promise<void> {
    // 1. 시그니처 검증
    const secret = this.configService.get<string>('TOSS_WEBHOOK_SECRET');
    if (secret) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('base64');
      if (signature !== expected) {
        throw new UnauthorizedException('유효하지 않은 웹훅 시그니처입니다.');
      }
    }

    // 2. 이벤트 타입 처리
    if (body.eventType === 'PAYMENT_STATUS_CHANGED') {
      const { paymentKey, status } = body.data;

      if (status === 'CANCELED') {
        const payment = await this.paymentRepository.findOne({
          where: { paymentKey },
        });
        if (payment) {
          await this.paymentRepository.remove(payment);
          this.logger.log(`결제 취소 처리 완료: paymentKey=${paymentKey}`);
        } else {
          this.logger.warn(`취소할 결제 레코드를 찾을 수 없음: paymentKey=${paymentKey}`);
        }
      }
    } else {
      this.logger.log(`지원하지 않는 웹훅 이벤트: ${body.eventType}`);
    }
  }
}

import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentService } from './payment.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('confirm')
  @UseGuards(JwtAccessGuard)
  confirm(@GetUser() user: User, @Body() dto: ConfirmPaymentDto) {
    return this.paymentService.confirm(user.id, dto);
  }

  @Post('webhook')
  @SkipThrottle()
  handleWebhook(
    @Headers('toss-signature') signature: string | undefined,
    @Body() body: WebhookEventDto,
  ) {
    return this.paymentService.handleWebhook(signature, body);
  }
}

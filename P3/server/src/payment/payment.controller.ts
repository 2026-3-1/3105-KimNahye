import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('payments')
@UseGuards(JwtAccessGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('confirm')
  confirm(@GetUser() user: User, @Body() dto: ConfirmPaymentDto) {
    return this.paymentService.confirm(user.id, dto);
  }
}

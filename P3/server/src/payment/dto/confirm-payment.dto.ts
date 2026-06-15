import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentKey: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  courseIds: string[];
}

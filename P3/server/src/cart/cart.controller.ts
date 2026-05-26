import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '@auth/guards/jwt-access.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartResponse } from './dto/cart-response.dto';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth('access-token')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 장바구니 목록 조회' })
  async getCart(
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<CartResponse>> {
    const data = await this.cartService.getCart(userId);
    return ApiResponseDto.success(data, '장바구니 조회에 성공하였습니다.', HttpStatus.OK);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '장바구니에 코스 추가' })
  async addToCart(
    @GetUser('id') userId: string,
    @Body() dto: AddToCartDto,
  ): Promise<ApiResponseDto<null>> {
    await this.cartService.addToCart(userId, dto);
    return ApiResponseDto.success(null, '장바구니에 추가되었습니다.', HttpStatus.CREATED);
  }

  @Delete(':courseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '장바구니 항목 개별 삭제' })
  async removeFromCart(
    @GetUser('id') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<ApiResponseDto<null>> {
    await this.cartService.removeFromCart(userId, courseId);
    return ApiResponseDto.success(null, '장바구니 항목이 삭제되었습니다.', HttpStatus.OK);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '장바구니 전체 비우기' })
  async clearCart(
    @GetUser('id') userId: string,
  ): Promise<ApiResponseDto<null>> {
    await this.cartService.clearCart(userId);
    return ApiResponseDto.success(null, '장바구니를 비웠습니다.', HttpStatus.OK);
  }
}

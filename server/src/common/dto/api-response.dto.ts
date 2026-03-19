import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: '요청 성공' })
  message: string;

  @ApiProperty()
  data: T | null;

  constructor(statusCode: number, message: string, data: T | null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success<T>(
    data: T,
    message: string,
    statusCode: number,
  ): ApiResponseDto<T> {
    return new ApiResponseDto(statusCode, message, data);
  }

  static error(message: string, statusCode: number): ApiResponseDto<null> {
    return new ApiResponseDto(statusCode, message, null);
  }
}

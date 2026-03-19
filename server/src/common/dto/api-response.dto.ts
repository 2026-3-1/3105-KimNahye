import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 200, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({ example: '요청 성공', description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '응답 데이터' })
  data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success<T>(
    data: T,
    message = '요청 성공',
    statusCode = 200,
  ): ApiResponseDto<T> {
    return new ApiResponseDto(statusCode, message, data);
  }
}

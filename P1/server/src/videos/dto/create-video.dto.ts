// src/videos/dto/create-video.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  youtubeVideoId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(1)
  duration: number; // 초(seconds) 단위

  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
